import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { NbDialogRef,NbDialogService,NbToastrService } from '@nebular/theme';
import { FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';

import { ParametersData } from '../../../@core/data/parameters';
import { ConfigurationData } from '../../../@core/data/configuration';
import { ConfigService } from '../../../@core/utils/services/config.service';
import 'datatables.net-fixedheader'
import { Subscription } from 'rxjs';
import { SaveRecipeModalConfirmComponent } from '../../../@core/utils/shared/save-recipe-modal-confirm/save-recipe-modal-confirm.component';
import { truncateWithEllipsis } from '@amcharts/amcharts4/.internal/core/utils/Utils';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'ngx-product-details',
  styleUrls: ['./product-details.component.scss'],
  templateUrl: './product-details.component.html',
})

export class ProductDetailsFullComponent implements OnInit, OnDestroy, AfterViewInit {

  selectedProcessCell: any;
  @Input() definitionId: any;
  @Input() definition;
  @Input() readonly;
  mainForm: FormGroup;
  canFormBeSaved
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  updatePlannedBatches = false;

  isLoading = false;

  data: any = [];
  defaultedValues = false;
  processCellsArray: any = [];
  loadSub: Subscription;

  helpLinkPage = 'product-definition-edit';
  helpPageLinkDestination = '#';

  constructor(
    private config: ConfigService,
    protected ref: NbDialogRef<ProductDetailsFullComponent>,
    protected saveModal: NbDialogRef<SaveRecipeModalConfirmComponent>,
    private configurationService: ConfigurationData,
    private parametersService: ParametersData,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private toastService: NbToastrService,
    public translate: TranslateService,
  ) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.waitConfigurationServiceLoaded();
    this.mainForm = this.fb.group({});
    this.checkForErrors();
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

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }

  updateTargetProcessCellData() {
    // this.processCellsArray = this.configurationService.getProcessCellsArray();
    this.loadDataTableOptions();
    this.updateTable();
  }

  getValidationColor() {
      return this.config.returnValidationColor(false);
  }

  updateTable() {

    this.parametersService.getProductDefinitionById(this.definitionId).then(definition => {

      this.processCellsArray = [...definition.activeProcessCells];

      this.definition = definition;
      const data = definition.productParameters;
      this.defaultedValues = false;
      data.forEach(row => {
        row.firstEnabledProcessCell =  Object.assign({}, this.findFirstEnabledProcessCell(row));
        row.defaultedValues = false;
        row.values.map(el => {
          if(el.isDefaulted === true) {
            this.defaultedValues = true;
            row.defaultedValues = true;
          }
        })
      })

      this.data = data.sort((a,b) => (a.orderingId > b.orderingId) ? 1 : ((b.orderingId > a.orderingId) ? -1 : 0))
      this.definition.activeProcessCells.forEach(col => {
        col.path = col.processCellPath;
        const value = { checked: col.isActive }
        this.toggleColumn(col, value);
      })
      this.isLoading = false;
    });
    this.dtTrigger.next();

  }


  onTrunkChange(processCell, ev, pos, processCellIndex) {
    this.mainForm.markAllAsTouched();
    ev.target.value = (+ev.target.value >= +ev.target.min ? (+ev.target.value <= +ev.target.max ? +ev.target.value : +ev.target.max ) : +ev.target.min).toString().padStart(2, '0');
    const expectedChangeoverTime = this.definition.activeProcessCells.find(pc => pc.processCellPath === processCell.path).unitsData[0].expectedChangeoverTime;
    if (expectedChangeoverTime) {
      const array = expectedChangeoverTime.split(':');
      array[pos] = ev.target.value;
      this.definition.activeProcessCells.find(pc => pc.processCellPath === processCell.path).unitsData[0].expectedChangeoverTime = `${array[0]}:${array[1]}:${array[2]}`;

      if( this.definition.expectedChangeoverTimeUniqueValues === true ) {
        this.definition.activeProcessCells.forEach(el =>{
          el.unitsData[0].expectedChangeoverTime = `${array[0]}:${array[1]}:${array[2]}`;
        })
      }
    }

  }

  getTrunk(isPCActive, string, pos) {
    if (isPCActive) {
      if (Array.isArray(string)) { string = string.toString(); }
      if (string) {
        const array = string.split(':');
        return array[pos];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  toggleManualColumn(processCell, value) {
    this.mainForm.markAsTouched();
    this.toggleColumn(processCell, value);
  }

  toggleColumn(processCell, value) {
    this.definition.activeProcessCells.find(pc => pc.processCellPath === processCell.path).isActive = value.checked;
    this.definition.productParameters.forEach(row=>{
      row.firstEnabledProcessCell = Object.assign({}, this.findFirstEnabledProcessCell(row));
    });
    this.definition.firstEnabledExpectedChange = Object.assign({}, this.findFirstEnabledExpectedChange(this.definition.activeProcessCells));
  }

  findFirstEnabledExpectedChange(activeProcessCells) {
    let cont = 0;
    let found;
    do {
      if(activeProcessCells[cont]) {
        const processCell = activeProcessCells[cont];
        const foundEl = this.definition?.activeProcessCells?.find(f => f.processCellPath === processCell.processCellPath);
        const isActive = foundEl.isActive;
        const pcPath = foundEl.processCellPath;
        const value = foundEl.unitsData[0].expectedChangeoverTime;
        found = {
          isActive: isActive,
          processCellPath: pcPath,
          value: value,
        }
        activeProcessCells.firstEnabledExpectedChange = found;
      }
      cont++;
    } while (found && found?.isActive !== true && cont < this.definition?.activeProcessCells.length);

    return found;
  }

  loadDataTableOptions() {
    this.dtOptions = {
      errMode: 'none',
      ordering: false,
      pagingType: 'full_numbers',
      //pageLength: 5,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
      scrollY:        true,
      scrollX:        true,
      scrollCollapse: true,
      // fixedHeader:  {
      //     header: true,

      // }
    };
  }


  findFirstEnabledProcessCell(row) {
    let found;

    const activeProcessCells = this.definition?.activeProcessCells.filter(el => el.isActive === true);
    const activefields = row.values;




    activefields.map(rowField => {
      if(found === undefined) {
        found = activeProcessCells.find(el => el.processCellPath === rowField.processCellPath);
      }
    });
    // if(found === undefined) {
    //   found = activeProcessCells[0]
    // }
    if (row.parameterDefinitionName === "CasePacker2ConversionFactor") {
    }
    return found;


  }

  emitChangeF(row) {
    this.updateRow(row.uniqueValues, row.firstEnabledProcessCell, row);
    this.updateLine(row);
  }

  touched() {
    this.mainForm.markAllAsTouched();
  }

  updateLine(row) {
    this.checkForErrors();
  }

  emitRowChange(row){
    row.changed = row.changed === undefined ? 1 : row.changed + 1;
  }

  toggleRow(row, value) {
    if(row) {
      const self = this;
      //
      setTimeout(() => {
        row.uniqueValues = (value.checked ? true : false);
        row.firstEnabledProcessCell = this.findFirstEnabledProcessCell(row);
        if (row.uniqueValues === true) {
          row.values.forEach((el, index) => {
            // el.value = ;
            row.values[index].value = Object.assign({}, row.firstEnabledProcessCell.value);
          });
        }
        this.updateRow(row.uniqueValues, row.firstEnabledProcessCell, row);
      });
      //
    }
  }

  updateRow(uniqueValues, firstActive, row) {
    row.values.forEach((pc, index) => { // find the firstActive
      if(uniqueValues === true && pc.processCellPath === firstActive.processCellPath) {
        firstActive.value = Object.assign({}, pc.value);
      }
    })
    row.values.forEach((pc, index) => { // loop and assign firstActive value
      if(uniqueValues === true && pc.processCellPath !== firstActive.processCellPath) {
        row.values[index].value = Object.assign({}, firstActive.value);
      }
    })
    this.emitRowChange(row)
  }

  checkEl(processCell, row) {
    const el = this.definition.activeProcessCells.find(pc => pc.processCellPath === processCell.path).isActive
    return el;
  }

  toggleChangeOverTimeRow(value) {
    const self = this;
    setTimeout(() => {
      this.definition.expectedChangeoverTimeUniqueValues = (value.checked ? true : false);
    if (this.definition.expectedChangeoverTimeUniqueValues) {
      this.definition.activeProcessCells.forEach((el, index) => {
        if (index > 0) {
          el.unitsData[0].expectedChangeoverTime = self.definition.activeProcessCells[0].unitsData[0].expectedChangeoverTime;
        }
      });
    }
    })

  }

  // updateOPB(event) {
  //     this.updatePlannedBatches = event.checked;
  // }

  onFormSubmit() {
    const self = this;

    this.dialogService.open(SaveRecipeModalConfirmComponent)
    .onClose.subscribe({
      next: (closeMode: any) => {
        //  closeMode  // 0 = cancel; 1 = no update; 2 = updatePlannedBatches
        if (closeMode == 2) {
          this.definition.updatePlannedBatches = true;
        } else {
          this.definition.updatePlannedBatches = false;
        }
        if (closeMode == 1 || closeMode == 2) {
          //self.ref.close(this.definition);
          let updateTable = false;
          this.isLoading = true;
          if (this.definition) {
            self.parametersService.updateProductDefinitionById(this.definition,this.definition.updatePlannedBatches,false).then((success) => {
              this.translate.get(["CALENDAR.SUCCESS","PRODUCT_DEFINITION.Product_definition_successfully_submitted"]).subscribe((translations) => {
                self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["PRODUCT_DEFINITION.Product_definition_successfully_submitted"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
              });
              updateTable = true;
              this.isLoading = false;
              self.ref.close(updateTable);
            }, error => {
              this.isLoading = false;
              this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
                this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
              });
            }
            );
          }

        }
      },
      error: (err: any) => {
      },
    });


  }

  checkForErrors() {
    const self = this;

    this.canFormBeSaved = true;
    Object.keys(this.mainForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.mainForm.get(key).errors;

      if (controlErrors != null) {
        const pc = key.split('_')
        //
        //   self.checkProcessCellWhithoutDots(pc[1], this.definition.activeProcessCells).isActive
        // );
        this.canFormBeSaved = false;
      }
    });
  }

  checkProcessCell(selectedProcessCell, processCellsArray) {
    if (processCellsArray) {
      return processCellsArray.find(el => el.processCellPath === selectedProcessCell.path);
    } else {
      return { isActive: false } ;
    }
  }

  cancel() {
    this.ref.close();
  }


  closeModal() {
    this.ref.close();
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }
  /**
   * LISTENERS
   */

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
