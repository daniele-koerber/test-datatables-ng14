import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { registerLocaleData } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NbToastrService, NbDialogRef } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigurationData } from '../../@core/data/configuration';
import { ParametersData } from '../../@core/data/parameters';
import { ProductDetailsSmallComponent } from './product-details-small/product-details.component';
import { ProductDetailsFullComponent } from './product-details-full/product-details.component';
import { ProductDetailsCardComponent } from './product-details-card/product-details-card.component';
import { DeleteModalConfirmComponent } from '../../@core/utils/shared/delete-modal-confirm/delete-modal-confirm.component';
import { ConfigService } from '../../@core/utils/services/config.service';
import {TranslateService} from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';

@Component({
  selector: 'ngx-product-definition',
  styleUrls: ['./product-definition.component.scss'],
  templateUrl: './product-definition.component.html',
})

export class ProductDefinitionComponent implements OnInit, OnDestroy {

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  data: any = [];
  serverNotificationstopic: string = 'ApiGateway';
  signalRListenersNames: string[] = ['ProductDefinitionsChanged'];
  lang;
  canManageProductDefinition = false;
  isLoading = true
  firstLoading = true;
  localeId
  loadSub: Subscription;

  helpLinkPage = 'product-definition';
  productDefinition: any;

  constructor(
    private config: ConfigService,
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private parametersService: ParametersData,
    private toastService: NbToastrService,
    public translate: TranslateService,
    private authService: NbAuthService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.localeId = this.translate.currentLang;
    let locale;
    switch (this.localeId) {
      case 'it':
        locale = localeIt
      break;
      case 'es':
        locale = localeEs
      break;
      default:
        locale = localeEn
      break;
    }
    registerLocaleData(locale, this.localeId);

    this.prepCustomMenu();
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadDataTableOptions();
    this.waitConfigurationServiceLoaded();

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanManageProductDefinition")) {
        this.canManageProductDefinition = true;
      }
    });
  }

  setHelpPage() { 
    this.config.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }

  updateTargetProcessCellData() {
    this.updateTable();
  }

  updateTable() {
    this.isLoading = true;
    this.parametersService.getProductsDefinitionList().then(productDefintions => {
      this.data = [...productDefintions];
      this.drawTable();
    });
  }

  drawTable() {
    if (this.datatableElement?.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.dtTrigger.next();
    this.isLoading = false;
    this.firstLoading = false;
  }

  loadDataTableOptions() {
    const datatableTranslations = require(`../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      // columnDefs: [
      //   { width: '20%', targets: 0 },
      //   { width: '20%', targets: 1 },
      //   { width: '20%', targets: 2 },
      //   { width: '15%', targets: 3 },
      //   { width: '15%', targets: 4 },
      //   { width: '10%', targets: 5 },
      // ],
      pagingType: 'full_numbers',
      //pageLength: 20,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      order: [1, 'asc'],
      columnDefs: [
        { targets: 4, type: 'date'  },
        { targets: [5,6], orderable: false }
      ],

      //scrollY:        true,
      //scrollX:        false,
      //scrollCollapse: false,

    };
  }

  getValidationColor(val) {
    return this.config.returnValidationColor(val);
  }

  deleteProductDefinition(id) {
    this.dialogService.open(DeleteModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.parametersService.deleteProductDefinition(id).then(res => {
            this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Product_definition_has_been_deleted"]).subscribe((translations) => {
              this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (res && res.hasOwnProperty('type') && res.type === 'UserDismiss' ? res.detail :  translations["CALENDAR.Product_definition_has_been_deleted"]), (res && res.hasOwnProperty('type') && res.type === 'UserDismiss' ? true : false));
            }, error => {
              this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
                this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
              });
              this.updateTable();
            }

            );

            this.updateTargetProcessCellData();

          })

          // this.data = this.data.filter(el => el.id !== id);
          // this.updateProductsDefinitionArray()
          // TODO send updated array to server
        }
      },
      error: (err: any) => {},
    });
  }

  updateProductsDefinitionArray() {
    // this.changeData.emit(this.data);
  }

  addNew() {
    this.translate.get("COMMON.Add_new_product_definition").subscribe((Add_new_product_definition) => {
      const obj = { id: null, title: Add_new_product_definition, definitions: this.data };
      this.dialogService.open(ProductDetailsSmallComponent, {
        context: obj as Partial<ProductDetailsSmallComponent>,
      }).onClose.subscribe({
        next: (definition: any) => {
          if (definition) {
            this.parametersService.duplicateProductDefinitionById(obj, definition).then(
              (definition) => {
                this.editProductDefinition(definition.id);
              }, error => {
                this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
                  this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
                });
                this.updateTable();
              }
            );
          }
          this.updateTargetProcessCellData();
        },
        error: (err: any) => {
          console.log(2, err);
        },
      });
    });
  }

  duplicateProductDefinition(definitionId) {
    this.translate.get("COMMON.Duplicate_product_definition").subscribe((Duplicate_product_definition) => {
    const obj = { id: definitionId, title: Duplicate_product_definition, definitions: this.data };
    this.dialogService.open(ProductDetailsSmallComponent, {
      context: obj as Partial<ProductDetailsSmallComponent>,
    }).onClose.subscribe({
      next: (definition: any) => {
        if (definition) {
          this.parametersService.duplicateProductDefinitionById(obj, definition).then(
            (definition) => {
              this.editProductDefinition(definition.id);
            }, error => {
              this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
                this.showToast('top-right', 'danger', translations["CALENDAR.SUCCESS"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
              });
              this.updateTable();
            }
          );
        }
      },
      error: (err: any) => {},
    });
  });
  }

  editProductDefinition(definitionId) {
    const self = this;
    const el = this.data.find(el => el.id === definitionId);
    const obj = { definition: el, definitionId: definitionId, readonly: true };
    this.dialogService.open(ProductDetailsFullComponent, {
      context: obj as Partial<ProductDetailsFullComponent>,
    }).onClose.subscribe({
      next: (updateTable: boolean) => {
        if (updateTable) {
          this.updateTable();
        }
        // if (definition) {
        //   self.parametersService.updateProductDefinitionById(definition,definition.updatePlannedBatches,false).then((success) => {
        //     this.translate.get(["CALENDAR.SUCCESS","PRODUCT_DEFINITION.Product_definition_successfully_submitted"]).subscribe((translations) => {
        //       self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["PRODUCT_DEFINITION.Product_definition_successfully_submitted"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
        //     });
        //     this.updateTable();
        //   }, error => {
        //     this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
        //       this.showToast('top-right', 'danger', translations["CALENDAR.SUCCESS"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
        //     });
        //   }
        //   );
        // }
      },
      error: (err: any) => {},
    });
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
        this.setHelpPage()
        this.updateTargetProcessCellData();
      }
    });
  }

  ProductDefinitionsChanged(message){
    this.updateTable();
  }

  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  getComponentSignalRListenersNames(){
    return this.signalRListenersNames;
  }

  getComponentSignalRSubscriptionType(){
    return "broadcast";
  }

  prepCustomMenu() {
    $(document).on('mousedown', function (e) {
      if ($(e.target).parents('.custom-menu').length === 0) {
        $('.custom-menu').hide(100);
      }
    });

    $('.custom-menu').on('click', function() {
      $('.custom-menu').hide(100);
    });

    $('.scrollable-container').on( 'scroll', () => {
      $('.custom-menu').hide(100);
    });
  }

  rowclick(event, row){
    const buttonPosition = $(event.srcElement).offset();
    this.productDefinition = row;
    let top = buttonPosition.top + 44;
    let left = buttonPosition.left - 171 + 46;
    if ( ($(window).height() - event.clientY - $('.custom-menu').height()) < 0) {
      top = row.canBeDeleted ? buttonPosition.top - 156 : buttonPosition.top - 106;
      $('.options-div').css('top', row.canBeDeleted ? 150 : 100 + 'px');
    } else {
      $('.options-div').css('top', '-50px');
    }

    $('.custom-menu').finish().toggle(100).css(
      {
        top: (top) + 'px',
        left: (left) + 'px',
      });
  }
}
