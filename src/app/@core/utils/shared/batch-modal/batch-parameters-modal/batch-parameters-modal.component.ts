import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { DataTableDirective } from 'angular-datatables';
import { ConfigurationData } from '../../../../data/configuration';
import { ParametersData } from '../../../../data/parameters';
import { SaveModalConfirmComponent } from '../../save-modal-confirm/save-modal-confirm.component';
import { Subject } from 'rxjs';
import { NbToastrService, NbDialogRef } from '@nebular/theme';
import { FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { BatchStatus } from '../../../../utils/services/config.service';

import { TabDisabledInterface } from '../tabs.interface';
import { BatchParameterChangesModalComponent } from './batch-parameter-changes-modal/batch-parameter-changes-modal.component';
import { ConfigService } from '../../../services';
//import 'datatables.net-fixedheader'
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-batch-parameters-modal',
  styleUrls: ['./batch-parameters-modal.component.scss'],
  templateUrl: './batch-parameters-modal.component.html',
})

export class BatchParametersModalComponent implements OnInit, OnDestroy{

  @Input() batch: any;
  @Input() processCellPath: any;
  @Input() tabIndex: number;
  @Output() tabDisabled: EventEmitter<TabDisabledInterface> = new EventEmitter<TabDisabledInterface>();
  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  isCompleted: boolean = false;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  data: any;

  mainForm: FormGroup;
  canFormBeSaved;
  translated_text_with_changes;
  showUpdatePageAlert = false;

  status;
  estimatedDuration ;
  productOrder ;
  productCode ;
  targetQuantity ;
  productionOrder: any;
  unit: any;
  controlRecipe: any;
  pcSub: Subscription;
  loadSub: Subscription;
  href: string;
  isReport = false;

  lang
  canEditParameters = false;
  isLoading

  constructor(
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private parametersService: ParametersData,
    private toastService: NbToastrService,
    protected ref: NbDialogRef<BatchParametersModalComponent>,
    private config: ConfigService,
    private fb: FormBuilder,
    public translate: TranslateService,
    private authService: NbAuthService,
    private router: Router,
  ) {
    this.config.translateBatchStatus();
    this.data = [];

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.translate.get("CALENDAR.with_changes").subscribe((translation) => {
      this.translated_text_with_changes = translation;
    });
  }


  ngOnInit() {
    const disabled: boolean = false;


    if(this.batch.status === BatchStatus.Completed) {
      this.isCompleted = true;
    }

    this.href = this.router.url;
    this.isReport = false;
    if (this.href === '/pages/report') {
      this.isReport = true;
    }

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanEditParameters")) {
        this.canEditParameters = true;
      }
    });

    const tab: TabDisabledInterface = {
      index: this.tabIndex,
      disabled: disabled,
    };
    this.tabDisabled.emit(tab);
    this.productionOrder = this.batch;


    this.unit = this.configurationService.getUnitByProcessCellPath(
      this.batch ?
      (Array.isArray(this.batch?.processCellPath) ? this.batch?.processCellPath[0] : this.batch.processCellPath )
      : this.processCellPath
      );
    this.updateTable();
    this.loadDataTableOptions();


    this.mainForm = this.fb.group({});
    this.checkForErrors();

  }

  onTrunkChange(ev, pos) {
    ev.target.value = (+ev.target.value >= +ev.target.min ? (+ev.target.value <= +ev.target.max ? +ev.target.value : +ev.target.max ) : +ev.target.min).toString().padStart(2, '0');
    const changeoverTime = this.data.changeoverTime
    if (changeoverTime) {
      const array = changeoverTime.split(':');
      array[pos] = ev.target.value;
      this.data.changeoverTime = `${array[0]}:${array[1]}:${array[2]}`;
    }
  }

  getTrunk(string, pos) {
    if (Array.isArray(string)) { string = string.toString(); }
    if (string) {
      const array = string.split(':');
      return array[pos];
    } else {
      return null;
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }

  getStatusName(val) {
    return this.config.getBatchStatus(val);
  }

  checkForErrors() {
    this.canFormBeSaved = true;
    Object.keys(this.mainForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.mainForm.get(key).errors;
      if (controlErrors != null) {
        this.canFormBeSaved = false;
      }
    });

    if(this.productionOrder.statusDescriptions === 'Completed') {
      this.canFormBeSaved = false;
    }
  }

  emitChangeF(row) {
    this.checkForErrors();

    if(row.parameterType === 'MandatoryParameterRouting') {
      this.showUpdatePageAlert = true;
    }
  }

  emitChange(event) {
  }

  showParameterChanges(parameter) {
    if(parameter.hasValueBeenModified === true){
      const pc = (this.batch.processCellPath ? this.batch.processCellPath : this.processCellPath);
      const obj = {
        batch: this.batch,
        parameter,
        order: this.batch,
        // path: pc,
        unitPath: this.unit.path
      };
      this.dialogService.open(BatchParameterChangesModalComponent, {
        context: obj as Partial<BatchParameterChangesModalComponent>,
      });
    }
  }


  saveChanges() {
    this.dialogService.open(SaveModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          // this.data.productParameterValues.shift(); // removes changeoverTime values before posting to backend
          this.parametersService.updateControlRecipe(this.data, this.data.id).then((success) => {
            this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Order_parameters_updated"]).subscribe((translations) => {
              this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Order_parameters_updated"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
            });
            this.showUpdatePageAlert = false;
            this.ngOnInit();
          });

        }
      },
      error: (err: any) => {
        this.translate.get(["CALENDAR.WARNING","SHARED.Errors_submitting_data"]).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? err.error.detail :  translations["SHARED.Errors_submitting_data"]), (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? true : false));
        });
      },
    });
  }


  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }


  // #region DATATABLE METHODS

  updateTable() {
    this.isLoading = true;
    //this.unit = this.configurationService.getUnitByProcessCellPath(this.selectedProcessCell.path);
    this.parametersService.getControlRecipe(this.unit, this.productionOrder.productionOrder).then((controlRecipe) => {
      controlRecipe.productParameterValues = controlRecipe.productParameterValues.sort((a,b) => (a.orderingId > b.orderingId) ? 1 : ((b.orderingId > a.orderingId) ? -1 : 0))
      this.data = controlRecipe; // quello che bisogna usare per popolare la tabella è il productParameterValues
      // this.data.productParameterValues.unshift(null);
      this.drawTable();
    });
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
    const datatableTranslations = require(`../../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      ordering: false,
      // columnDefs: [
      //   { width: '40%', targets: 0 },
      //   { width: '40%', targets: 1 },
      //   { width: '10%', targets: 2 },
      //   { width: '10%', targets: 3 },
      // ],
      pagingType: 'full_numbers',
     // pageLength: 5,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
      // scrollY:        true,
      // scrollX:        false,
      // scrollCollapse: false,
     // fixedHeader:  {
       //   header: true,
       //   footer: true
     // }
    };
  }
  //#endregion


  //#region ProcessCell LISTENERS
  updateTargetProcessCellData() {
    //this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    // this.unit = this.configurationService.getUnitByProcessCellPath(this.selectedProcessCell);
    this.updateTable();
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
        this.updateTargetProcessCellData();
      }
    });
  }
  //#endregion


}
