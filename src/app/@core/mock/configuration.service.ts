import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { NbToastrService } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';

import { ConfigurationData } from '../data/configuration';
import { ConfigService, ApiService } from '../utils/services';

@Injectable()
export class ConfigurationService extends ConfigurationData {

  private componentLoaded = new BehaviorSubject(false);
  public hasComponentLoaded = this.componentLoaded.asObservable();

  configurationServerUrl: string;

  bypassDisplayGroups: boolean;
  filterDisplayGroupID: number = null;

  processCellsArray = <any>[];
  unitArray = <any>[];
  selectedProcessCell = undefined;
  private selectedProcessCellWatcher = new BehaviorSubject(this.selectedProcessCell);
  public hasSelectedProcessCellChanged = this.selectedProcessCellWatcher.asObservable();

  displayGroup;
  plantHierarchy = null;
  machinesArray = [];
  componentsArray = [];
  lang
  customSettings = {};

  constructor(
    private config: ConfigService,
    private api: ApiService,
    private toastService: NbToastrService,
    private authService: NbAuthService,
    public translate: TranslateService,
  ) {
    super();
    this.configurationServerUrl = this.config.getConfigurationServerUrl();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage()
    translate.use(this.lang)

    this.checkDisplayGroupPermissionsAndBuildHierarchy();
  }

  forceDisplayGroupCheck(){
    this.processCellsArray = [];
    this.machinesArray = [];
    this.checkDisplayGroupPermissionsAndBuildHierarchy();
  }

  canBypassDisplayGroup() {
    const promise = new Promise((resolve, reject) => {
      this.authService.getToken().subscribe(async (token: NbAuthJWTToken) => {
        const payload = await token.getPayload();
        const featuresList = payload.features;
          this.bypassDisplayGroups = (featuresList.find(el => el === 'CanBypassDisplayGroup') ? true : false);
          if(!this.bypassDisplayGroups) {
              resolve(false);
          } else { resolve(true) }
      });
    });
    return promise;
  }

  getFIlteredDisplayGroup() {
    return this.filterDisplayGroupID;
  }

  checkDisplayGroupPermissionsAndBuildHierarchy() {
    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const validToken = token.isValid();
      const payload = token.getPayload();
      const featuresList = payload.features;
      this.bypassDisplayGroups = (featuresList.find(el => el === 'CanBypassDisplayGroup') ? true : false);

      if (validToken) {
        this.getDisplayGroups().then((res) => {
          const diplayGroups = res
          if(!this.bypassDisplayGroups) {
            this.filterDisplayGroupID = +localStorage.getItem(`displayGroupID`);
            if(!this.filterDisplayGroupID) {
              localStorage.setItem(`displayGroupID`, '');
              this.translate.get(["CALENDAR.WARNING","CALENDAR.Display_Group_not_configured"]).subscribe((translations) => {
                this.showToast('top-right', 'danger', translations['CALENDAR.WARNING'], translations["CALENDAR.Display_Group_not_configured"]);
              });
              //By defult set first display group available
              if (diplayGroups) {
                localStorage.setItem(`displayGroupID`, ''+diplayGroups[0].id)
                this.filterDisplayGroupID = +localStorage.getItem(`displayGroupID`);
                if (this.filterDisplayGroupID) {
                  this.triggerStatus();
                }
              }

            } else { this.triggerStatus(); }
          } else { this.triggerStatus(); }
        }).catch(error => {
          this.translate.get(["CALENDAR.WARNING","CALENDAR.Error_while_getting_data"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations['CALENDAR.WARNING'], translations["CALENDAR.Error_while_getting_data"],true);
          });
        });
      }

    });
  }

  triggerStatus(){
    this.buildPlantHierarchy().then(
      (result: boolean) => {
        this.buildCustomSettings().then(
          (result: boolean) => {
            this.nextStatus(result);
          },
          (reason: any) => {

          },
        );
      },
      (reason: any) => {

      },
    );
  }

  getPlantHierarchy() {
    return this.plantHierarchy;
  }

  getSelectedProcessCell() {

    const selProcCell = sessionStorage.getItem('selProcessCell');
    const obj = JSON.parse(selProcCell);
    return obj;
  }

  resetSelectedProcessCell() {

    sessionStorage.removeItem('selProcessCell');
    return;
  }

  setSelectedProcessCell(line) {
    this.selectedProcessCell = line;
    if(line && line !== undefined) {
      sessionStorage.setItem('selProcessCell', JSON.stringify(line));
      this.nextLineStatus(line);
    }
  }

  getProcessCell(path) {
    return this.processCellsArray.find(el => el.path === path);
  }

  getProcessCellsArray() {
    return this.processCellsArray;
  }
  getUnitArray() {
    return this.unitArray;
  }

  nextStatus(status: boolean) {
    this.componentLoaded.next(status);
  }

  nextLineStatus(line: any) {
    this.selectedProcessCellWatcher.next(line);
  }

  getDisplayGroups() {

    const self = this;
    const promise = new Promise((resolve, reject) => {
      const url = `${this.configurationServerUrl}${this.lang}/displaygroups`;
      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => {
            reject(msg); },
        );
      });
    return promise;
  }

  getDisplayGroupsByProcessCellPath(path) {

    const promise = new Promise((resolve, reject) => {
      const url = `${this.configurationServerUrl}${this.lang}/processcells/${path}/displaygroups`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          }
        );
      });
    return promise;
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  buildPlantHierarchy() {
    const self = this;
    const promise = new Promise((resolve, reject) => {

      const url = `${this.configurationServerUrl}${this.lang}/full`;
      this.api.get(url)
        .toPromise()
        .then(
          async res => {
            const enterprises = res;
            self.processCellsArray = [];
            self.machinesArray = [];
            self.componentsArray = [];
            enterprises.forEach(enterprise => {
              enterprise.sites.forEach(site => {
                site.areas.forEach(area => {
                  area.processCells.forEach(processCell => {
                    self.processCellsArray.push({
                      settings: processCell.settings,
                      areaSettings: area.settings,
                      key: '' + processCell.id,
                      uom: '' + processCell.uoM,
                      name: processCell.description,
                      path: `${enterprise.code}.${site.code}.${area.code}.${processCell.code}`,
                    });
                    processCell.units.forEach(unit => {
                      self.unitArray.push({
                        key  : '' + unit.id,
                        name : unit.description,
                        path : `${enterprise.code}.${site.code}.${area.code}.${processCell.code}.${unit.code}`,
                      });
                      unit.machines.forEach(machine => {
                        self.componentsArray.push(...machine.machineComponents);
                        self.machinesArray.push({
                          machineComponents: machine.machineComponents,
                          displayGroup: machine.displayGroup,
                          key: '' + machine.id,
                          uom: machine.productionCountersUoM,
                          name: machine.description,
                          path: `${enterprise.code}.${site.code}.${area.code}.${processCell.code}.${unit.code}.${machine.code}`,
                        });
                      });
                    });
                  });
                });
              });
            });

            // if(!this.bypassDisplayGroups) {
            //   self.machinesArray = self.machinesArray.filter(el => el.displayGroup.id === this.filterDisplayGroupID);
            //   const filtered = self.processCellsArray.map(pcEl=>{
            //     return (this.machinesArray.some(el =>{
            //       return el.path.includes(pcEl.path); }) ? pcEl : false);
            //   }).filter(el=> el!==false);
            //   self.processCellsArray = filtered;
            // }

            if (self.processCellsArray.length) {
              var selectedProcessCell = JSON.parse(sessionStorage.getItem("selProcessCell"));
              if(!this.bypassDisplayGroups || !selectedProcessCell) {
                const displayGroups:any = await this.getDisplayGroups();
                if (displayGroups) {
                  var displayGroupsArray = []
                  displayGroups.map(el => {
                    displayGroupsArray.push({ id:el.id, processCellPath: el.processCellPath });
                  });
                  this.filterDisplayGroupID = +localStorage.getItem(`displayGroupID`);
                  if (this.filterDisplayGroupID) {
                    const displayGroup = displayGroupsArray.find(el => el.id === this.filterDisplayGroupID);
                    if (displayGroup) {
                      selectedProcessCell = this.getProcessCell(displayGroup.processCellPath) ;
                      this.setSelectedProcessCell(selectedProcessCell);
                    }
                  }
                }
              }

              if(selectedProcessCell) {
                self.selectedProcessCell = selectedProcessCell;
              } else {
                self.selectedProcessCell = self.processCellsArray[0];
                this.setSelectedProcessCell(self.selectedProcessCell);
              }
            }
            self.plantHierarchy = enterprises;
            resolve(true);
          },
          msg => {
            reject(msg); },
        );
      });
    return promise;

  }

  getCustomSettings() {
    const settings = Object.assign({ ERP_orders_enabled: true, CMMS_link_enabled: true}, this.customSettings);
    return settings;
  }

  buildCustomSettings() {
    const self = this;
    const promise = new Promise((resolve, reject) => {

      const url = `${this.configurationServerUrl}${this.lang}/full`;
      this.api.get(url)
        .toPromise()
        .then(async res => {
          this.customSettings = res;
          resolve(true);
        },
        msg => {
          reject(msg);
        });
      });
    return promise;

  }

  getMachines(processCellPath) {
    if(processCellPath) {
      // console.log(this.machinesArray, processCellPath);
      return this.machinesArray.filter(el => {
        return el.path.indexOf(processCellPath) >= 0;
      });
    }
    return this.machinesArray;
  }
  getMachineByMachinePath(machinePath) {
    const machine = this.machinesArray.find(el => el.path === machinePath);
    return (machine ? machine : null);
  }
  getMachineNameByMachinePath(machinePath) {
    const machine = this.machinesArray.find(el => el.path === machinePath);
    return (machine ? machine.name : '');
  }
  getComponentByComponentPath(componentPath) {
    const component = this.componentsArray.find(el => el.fullPath === componentPath);
    return (component ? component.description : '');
  }

  getUnitByProcessCellPath(processCellPath){
    return this.unitArray.find(el => el.path.includes(processCellPath));
  }
  getUoMByProcessCellPath(processCellPath){
    return this.processCellsArray.find(el => el.path.includes(processCellPath)).uom;
  }

  getLiveDataByProcessCellPath(processCellPath){
    const liveData1 =  this.processCellsArray.find(el => el.path.includes(processCellPath)).settings.liveData1;
    const liveData2 =  this.processCellsArray.find(el => el.path.includes(processCellPath)).settings.liveData2;
    return [liveData1, liveData2] as const
  }

}
