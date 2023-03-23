import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-ecommerce',
  templateUrl: './e-commerce.component.html',
})



export class ECommerceComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  constructor(
    public translate: TranslateService,
  ) {
    translate.setDefaultLang("en");
    const browserLang = translate.getBrowserLang();
    translate.use("en");

    
  }

  ngOnInit(){
    this.loadDataTableOptions();
  }

  drawTable() {
    if (this.datatableElement.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.dtTrigger.next();
  }

  loadDataTableOptions() {
    const datatableTranslations = require(`../../../assets/i18n/dataTables/en.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      pagingType: 'full_numbers',
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
      order: [1, 'desc'],
      columnDefs: [
        { targets: 1, type: 'date'  },
        { targets: [3,4], orderable: false }
      ],
      fixedHeader:  {
        header: true,
        footer: true
    }
    };

    this.drawTable();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
