import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule, NbButtonModule, NbIconModule, NbTabsetModule, NbSpinnerModule } from '@nebular/theme';
import { SharedModule } from '../../@core/shared.module';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReportComponent } from './report.component';
import { ReportDetailsComponent } from './report-details/report-details.component';
import { ActualOrderCardComponent } from './report-details/actual-order-card/actual-order-card.component';
import { ReportButtonsCardComponent } from './report-details/report-buttons-card/report-buttons-card.component';
import { MachineStatusCardComponent } from './report-details/machine-status-card/machine-status-card.component';
import { QualityReportTableModalComponent } from './report-details/quality-report-table-modal/quality-report-table-modal.component';
import { DowntimeReportTableModalComponent } from './report-details/downtime-report-table-modal/downtime-report-table-modal.component';
import { CorrectiveActionsComponent } from './report-details/quality-report-table-modal/corrective-actions/corrective-actions.component';
import { DownloadPdfConfirmComponent } from '../../@core/utils/shared/download-pdf-confirm/download-pdf-confirm.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { DxAutocompleteModule } from 'devextreme-angular';
import { MachineStatusDetailCardComponent } from './report-details/machine-status-card/machine-status-detail-card/machine-status-detail-card.component';
import { ActualShiftReportCardComponent } from './report-details/actual-shift-report-card/actual-shift-report-card.component';
import { OrdersListReportCardComponent } from './report-details/orders-list-report-card/orders-list-report-card.component';

// import { RealtimeTabComponent } from '../../@core/utils/shared/realtime-tab/realtime-tab.component';

@NgModule({
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NbTabsetModule,
    MatCheckboxModule,
    SharedModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    DxAutocompleteModule,
    NbSpinnerModule
  ],
  declarations: [
    ReportComponent,
    ReportDetailsComponent,
    ActualOrderCardComponent,
    MachineStatusCardComponent,
    ReportButtonsCardComponent,
    QualityReportTableModalComponent,
    DowntimeReportTableModalComponent,
    CorrectiveActionsComponent,
    MachineStatusDetailCardComponent,
    ActualShiftReportCardComponent,
    OrdersListReportCardComponent,

  ],
  providers: [],
})
export class ReportModule { }
