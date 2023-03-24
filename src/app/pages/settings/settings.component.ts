import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { DataTableDirective } from 'angular-datatables';
import { ConfigurationData } from '../../@core/data/configuration';
import { DowntimeData } from '../../@core/data/downtime';
import { QualityData } from '../../@core/data/quality';
import { SchedulingData } from '../../@core/data/scheduling';
import { ConfigService } from '../../@core/utils/services';
import { Observable, Subject } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { Subscription } from 'rxjs';
import { IntegrationData } from '../../@core/data/integration';
import { BaseClass } from '../../@core/utils/common/base-class/base-class';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'ngx-settings',
  styleUrls: ['./settings.component.scss'],
  templateUrl: './settings.component.html',
})

export class SettingsComponent extends BaseClass implements OnInit, OnDestroy {

  // @ViewChild(table1: DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  results$: Observable<any>;
  subject = new Subject();

  form: FormGroup;
  model: any;

  isLoading;
  dg = 0;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  dtOptions1: any = {};

  data: any = [];
  filteredData: any = [];

  selectedProcessCell: any;
  defaultValue = null;
  globalValue = null;
  toggleArray: any[];
  processCellsArray: any;
  lang
  canEditQualitySettings = false;
  canEditDowntimeSettings= false;
  canManageUsers = false;
  canEditCalendarSettings= false;
  displayGroupsArray = [];
  selectedDisplayGroup = null;
  selectedDisplayGroupId = null;
  defaultVoidMenuVoice = '';
  pcSub: Subscription;
  loadSub: Subscription;

  helpLinkPage = 'settings';

  downtimeMaxLifetime
  refMachineDelayForDowntimeBegin = {
    hours: 0,
    minutes: 0,
  }
  refMachineDelayForDowntimeEnd = {
    hours: 0,
    minutes: 0,
  }
  autoSuspendInDowntimeOnNoProductionSlot = false;

  constructor(
    private configurationService: ConfigurationData,
    private qualityService: QualityData,
    private downtimeService: DowntimeData,
    private integrationService: IntegrationData,
    private toastService: NbToastrService,
    private config: ConfigService,
    public translate: TranslateService,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.translate.get(["SHARED.Select"]).subscribe((translations) => {
      this.defaultVoidMenuVoice = translations["SHARED.Select"];
    });

    this.subject.pipe(
      debounceTime(1000),
      map(() => {
        this.saveChanges()
      })
    ).subscribe();

  }
  
  onChange() {
    this.subject.next();
  }

  goToUsersSettings(){
    const link = this.config.getUserSettingsAdminPageLinkDestination();
    window.open(link, "_blank");    
  }

  setValue(event) {
    const value = event.value;
    const el = this.displayGroupsArray.find(el => el.value === value)
    this.selectedDisplayGroup = el;
    this.onChange();
  }

  async saveChanges() {
    localStorage.setItem(`displayGroupID`, this.selectedDisplayGroup?.value)

    if(await this.saveQualityForm() === false) return;
    if(await this.saveDowntimeForm1() === false) return;
    if(await this.saveDowntimeForm2() === false) return;
    // if(await this.saveCalendarForm() === false) return;
  }

  saveQualityForm(): boolean{
    return this.qualityService.saveQualitySettings(this.selectedProcessCell.path, this.data).then(
      (success) => {
        this.translate.get(["CALENDAR.SUCCESS", "CALENDAR.Settings_saved"]).subscribe((translations) => {
          this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail : translations["CALENDAR.Settings_saved"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
        });
        return true;
      },
      (error) => {
        this.translate.get(["CALENDAR.WARNING", "CALENDAR.Errors_while_saving_settings"]).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail : translations["CALENDAR.Errors_while_saving_settings"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
        });
        return false;
      }
    );
  }

  saveDowntimeForm1(){
    return this.downtimeService.saveDowntimeSettings(this.selectedProcessCell.path,
      {
        downtimeMaxLifetime: this.downtimeMaxLifetime,
        // refMachineDelayForDowntimeBegin: this.refMachineDelayForDowntimeBegin,
        // refMachineDelayForDowntimeEnd: this.refMachineDelayForDowntimeEnd
      }).then(
      (success) => { // Success
        this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Settings_saved"]).subscribe((translations) => {
          this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Settings_saved"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
        });
        return true;
      },
      (error) => { // Error
        this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_while_saving_settings"]).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_while_saving_settings"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
        });
        return false;
      },
    );
  }

  // saveCalendarForm(){
  //   return this.integrationService.saveCalendarSettings(this.selectedProcessCell.path,
  //     {
  //       autoSuspendInDowntimeOnNoProductionSlot: this.autoSuspendInDowntimeOnNoProductionSlot
  //     }).then(
  //     (success) => { // Success
  //       this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Settings_saved"]).subscribe((translations) => {
  //         this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Settings_saved"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
  //       });
  //       return true;
  //     },
  //     (error) => { // Error
  //       this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_while_saving_settings"]).subscribe((translations) => {
  //         this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_while_saving_settings"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
  //       });
  //       return false;
  //     },
  //   );
  // }

  saveDowntimeForm2(){
    return this.integrationService.saveDowntimeSettings(this.selectedProcessCell.path,
      {
        refMachineDelayForDowntimeBegin: this.refMachineDelayForDowntimeBegin,
        refMachineDelayForDowntimeEnd: this.refMachineDelayForDowntimeEnd,
        autoSuspendInDowntimeOnNoProductionSlot: this.autoSuspendInDowntimeOnNoProductionSlot
      }).then(
      (success) => { // Success
        this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Settings_saved"]).subscribe((translations) => {
          this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Settings_saved"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
        });
        return true;
      },
      (error) => { // Error
        this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_while_saving_settings"]).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_while_saving_settings"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
        });
        return false;
      },
    );
  }

  ngOnInit() {

    this.loadDataTableOptions();
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();

    this.nbAuthService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanEditQualitySettings")) {
        this.canEditQualitySettings = true;
      }
      if (payload.features.includes("CanManageUsers")) {
        this.canManageUsers = true;
      }
      if (payload.features.includes("CanEditDowntimeSettings")) {
        this.canEditDowntimeSettings = true;
      }
      if (payload.features.includes("CanEditCalendarSettings")) {
        this.canEditCalendarSettings = true;
      }


    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    if (this.subject) {
      this.subject.unsubscribe();
    }
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.processCellsArray = this.configurationService.getProcessCellsArray();
    this.updateTable();
  }

  updateTable() {
    this.integrationService.getDowntimeSettings(this.selectedProcessCell.path).then(settings => {
      // this.downtimeMaxLifetime = settings.downtimeMaxLifetime;
      this.refMachineDelayForDowntimeBegin = settings.refMachineDelayForDowntimeBegin;
      this.refMachineDelayForDowntimeEnd = settings.refMachineDelayForDowntimeEnd;
    });
    this.downtimeService.getDowntimeSettings(this.selectedProcessCell.path).then(settings => {
      this.downtimeMaxLifetime = settings.downtimeMaxLifetime;
      // this.refMachineDelayForDowntimeBegin = settings.refMachineDelayForDowntimeBegin;
      // this.refMachineDelayForDowntimeEnd = settings.refMachineDelayForDowntimeEnd;
    });

    this.qualityService.getQualitySettings(this.selectedProcessCell.path).then(settings => {
      this.isLoading = true;
      this.data = settings;
      this.filteredData = this.data;
      this.drawTable();
    });

  }

  drawTable() {
    // if (this.datatableElement.dtInstance) {
    //   this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.destroy();
    //   });
    // }
    this.dtTrigger.next();
    this.isLoading = false;
  }

  loadDataTableOptions() {
    const datatableTranslations = require(`../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      columnDefs: [
        { width: '40%', targets: 0 },
        { width: '10%', targets: 1 },
        { width: '10%', targets: 2 },
        { width: '20%', targets: 3 },
        { width: '20%', targets: 4 },
        {orderable: false, targets: [0, 1, 2, 3, 4]},
      ],
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar

    };
    this.dtOptions1 = {
      errMode: 'none',
      language: datatableTranslations,
      columnDefs: [
        { width: '40%', targets: 0 },
        { width: '60%', targets: 1 },
        {orderable: false, targets: [0, 1]},
      ],
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar

    };
  }

  showFiltered(value: any) {
    this.defaultValue = value;
    this.filteredData = (JSON.parse(value) !== null ? this.data.filter(el => el.status === JSON.parse(value) && JSON.parse) : this.data);
    this.drawTable();
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  //#region LISTENERS

  async getDisplayGroups() {
    const self = this;
    const displayGroup = localStorage.getItem(`displayGroupID`);
    this.selectedDisplayGroupId = (displayGroup !== '' ? displayGroup : null);
    const displayGroupsArray = await this.configurationService.getDisplayGroups();
    displayGroupsArray.map(el => {
      this.displayGroupsArray.push({ value:el.id, name: el.processCellDescription + ' - ' + el.description });
    });
    if(this.selectedDisplayGroupId) {
      self.selectedDisplayGroup = self.displayGroupsArray.find(el => el.value === +this.selectedDisplayGroupId)
    }
    this.displayGroupsArray.sort((a, b) => a.name > b.name ? 1 : -1);
    self.defaultVoidMenuVoice = 'None';
  }

  setHelpPage() { 
    this.config.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }




  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.setHelpPage();
        this.updateTargetProcessCellData();
        this.getDisplayGroups();
      }
    });
  }
  //#endregion

}
