import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NbDialogRef } from '@nebular/theme';

import { SchedulingData } from '../../../../../data/scheduling';
import { IntegrationData } from '../../../../../data/integration';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../../../services/config.service';

import { ConfigurationData } from '../../../../../data/configuration';
import { ParametersData } from '../../../../../data/parameters';
import * as moment from 'moment';




@Component({
  selector: 'ngx-batch-parameter-changes-modal',
  styleUrls: ['./batch-parameter-changes-modal.component.scss'],
  templateUrl: './batch-parameter-changes-modal.component.html',
})

export class BatchParameterChangesModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() parameter: any;
  @Input() order: any;
  @Input() batch: any;
  @Input() unitPath: string;
  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  version:number;
  productOrder: string;
  productCode: string;
  data: any[];
  lang;

  isLoading

  helpLinkPage = 'batch-parameter-changes-modal';
  helpPageLinkDestination = '#';

  constructor(
    private integrationService: IntegrationData,
    private scheduleService: SchedulingData,
    private configurationService: ConfigurationData,
    private parametersService: ParametersData,
    public translate: TranslateService,
    private config: ConfigService,
    protected ref: NbDialogRef<BatchParameterChangesModalComponent>,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
  }

  ngOnInit() {
    this.loadDataTableOptions();
    this.setHelpPage();
  }

  openHelp () {
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() {
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngAfterViewInit(): void {
    // this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // #region DATATABLE METHODS

  updateTable() {
    const self = this;
    self.data = [];
    this.isLoading = true;

    this.integrationService.getBatchParameterChanges(this.parameter.parameterName, this.order.productionOrder, this.unitPath)
    .then(result =>{
      if(result.batchParameters){
        const parameters = [...result.batchParameters];
        parameters.map(parameter=>{
          let parsedObj = JSON.parse(parameter.value);
          let changedValueText = "";
          if (parsedObj.Speed !== undefined)
          { changedValueText = JSON.stringify(parsedObj.Speed); }
          else if (parsedObj.Value !== undefined)
          { changedValueText = JSON.stringify(parsedObj.Value); }
          else if (parsedObj.ValueSP !== undefined && parsedObj.ValueMIN !== undefined && parsedObj.ValueMAX !== undefined)
          { 
            var newObj = {
              Min: parsedObj.ValueMIN,              
              Setpoint: parsedObj.ValueSP,
              Max: parsedObj.ValueMAX
            }
            changedValueText = this.splitObj(newObj); 
          }
          else if (parsedObj.SelectedDestinations !== undefined)
          { changedValueText = JSON.stringify(parsedObj.SelectedDestinations); }
          //Remove double quotes
          changedValueText = changedValueText.replace(/^["'](.+(?=["']$))["']$/, '$1');
          self.data.push({
            value: changedValueText,
            user: parameter.modifier,
            dateTime: new Date(parameter.updatedOn),
          })
        })
      }
      this.drawTable();
    });
}

splitObj(obj){
  let returnValue = '';
  for (const [key, value] of Object.entries(obj)) {
    returnValue += (`${key}:\xa0${value}, `);
  }
  return returnValue.slice(0,-2);
}

  drawTable() {
    if (this.datatableElement.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.dtTrigger.next();
    this.isLoading = false;
  }

  loadDataTableOptions() {
    const datatableTranslations = require(`../../../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      columnDefs: [
        { width: '30%', targets: 0 },
        { width: '30%', targets: 1 },
        { 
          width: '40%',
          targets: 2,
          // render: function(data, type){
          //   if (data !== null) {
          //     var wrapper = moment(data);
          //     return wrapper.format("MM/DD/YYYY h:mm:ss A");
          //   }
          // }
        },
      ],
      order: [[2, 'desc']],
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
    };

    this.updateTable();
  }

  //#endregion
  closeModal() {
    this.ref.close(true);
  }

}
