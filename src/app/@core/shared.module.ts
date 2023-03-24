import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularKdsLibraryModule } from './utils/KDS/lib/angular-kds-library.module';
import {
  NbCardModule,
  NbButtonModule,
  NbTabsetModule,
  NbDatepickerModule,
  // NbTimepickerModule,
  NbInputModule,
  NbAlertModule,
  NbIconModule,
  NbBadgeModule,
  NbRadioModule, NB_TIME_PICKER_CONFIG, NbTimepickerModule, NbSpinnerModule, NbTooltipModule,
} from '@nebular/theme';

import {
  CapitalizePipe,
  PluralPipe,
  LocalDatePipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
  SecondsToDurationPipe,
  HoursToDaysPipe,
  TicksToDurationPipe,
  DateFormatPipe,
  RemoveCommaPipe
} from './../@theme/pipes';



import { RoutingMasterOptionalComponent } from './utils/shared/batch-modal/routing-master-optional/routing-master-optional.component';

import { ProductsQualityRangeParameterComponent } from './utils/shared/products/quality-range-parameter/quality-range-parameter.component';
import { ProductsQualityTypeParameterComponent } from './utils/shared/products/quality-type-parameter/quality-type-parameter.component';
import { ProductsRoutingParameterComponent } from './utils/shared/products/routing-parameter/routing-parameter.component';
import { ProductsWorkingParameterComponent } from './utils/shared/products/working-parameter/working-parameter.component';
import { ProductsMandatoryParameterSpeedComponent } from './utils/shared/products/mandatory-parameter-speed/mandatory-parameter-speed.component';
import { ProductsMandatoryParameterUnitConversionComponent } from './utils/shared/products/mandatory-parameter-unit-conversion/mandatory-parameter-unit-conversion.component';

import { CalendarQualityRangeParameterComponent } from './utils/shared/calendar/quality-range-parameter/quality-range-parameter.component';
import { CalendarQualityTypeParameterComponent } from './utils/shared/calendar/quality-type-parameter/quality-type-parameter.component';
import { CalendarRoutingParameterComponent } from './utils/shared/calendar/routing-parameter/routing-parameter.component';
import { CalendarWorkingParameterComponent } from './utils/shared/calendar/working-parameter/working-parameter.component';
import { CalendarMandatoryParameterSpeedComponent } from './utils/shared/calendar/mandatory-parameter-speed/mandatory-parameter-speed.component';
import { CalendarMandatoryParameterUnitConversionComponent } from './utils/shared/calendar/mandatory-parameter-unit-coversion/mandatory-parameter-unit-conversion.component';

import { DataTablesModule } from 'angular-datatables';

import { ChartModule } from 'angular2-chartjs';


import { RadioWithFlag } from './custom-form-components/radio-with-flag/radio-with-flag';
import { InputWithFlag } from './custom-form-components/input-with-flag/input-with-flag';
import { ConnectedCheckbox } from './custom-form-components/connected-checkbox/connected-checkbox';
import { FormFieldTabs } from './custom-form-components/tabs/tabs.type';
import { QualityCheckFormComponent } from './custom-form-components/quality-check-form/quality-check-form.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { ServerNotificationsComponent } from './utils/shared/server-notifications/server-notifications';

import { SelectLineComponent } from './utils/material/select-line/select-line.component';
import { ProgressBarComponent } from './utils/shared/progress-bar/progress-bar.component';
import { ButtonsToggleComponent } from './utils/material/buttons-toggle/buttons-toggle.component';
import { MaterialSelectComponent } from './utils/material/material-select/material-select.component';
import { MaterialSelectParametersComponent } from './utils/material/material-select-parameters/material-select-parameters.component';
import { MaterialMultipleSelectComponent } from './utils/material/material-multiple-select/material-multiple-select.component';
import { MaterialButtonsComponent } from './utils/material/material-buttons/material-buttons.component';

import { MachineOeeChartComponent } from './utils/shared/machine-oee-chart/machine-oee-chart.component';
import { LineStatusChartComponent } from './utils/shared/line-status-chart/line-status-chart.component';
import { MachinesStatusHistoryChartComponent } from './utils/shared/line-status-chart/machines-status-history/machines-status-history-chart.component';
import { MachinesStatusChartComponent } from './utils/shared/line-status-chart/machines-status/machines-status-chart.component';

import { LineStatusModalComponent } from './utils/shared/line-status-chart/details-modal/line-status-modal.component';
import { MachineSpeedChartComponent } from './utils/shared/line-status-chart/machines-speed-chart/machines-speed-chart.component';
import { MachineDataDetailsComponent } from './utils/shared/line-status-chart/machine-data-details/machine-data-details.component';

import { DowntimeReasonsComponent } from './utils/shared/downtime-reasons-chart/downtime-reasons-chart.component';
import { DowntimeAlarmsComponent } from './utils/shared/downtime-alarms-chart/downtime-alarms-chart.component';
import { AlarmsSummaryComponent } from './utils/shared/alarms-summary-chart/alarms-summary-chart.component';

import { MachineDowntimeComponent } from './utils/shared/machine-downtime-chart/machine-downtime-chart.component';
import { MachinePerformanceComponent } from './utils/shared/machine-performance-chart/machine-performance-chart.component';
import { LinePerformanceByHoursComponent } from './utils/shared/line-performance-by-hours-chart/line-performance-by-hours-chart.component';
import { DowntimeAlarmsDetailsChartComponent } from './utils/shared/downtime-alarms-details-chart/dowtime-alarms-details-chart.component';
import { AlarmsTimelineChartComponent } from './utils/shared/alarm-timeline-chart/alarm-timeline-chart.component';

import { PiecesProgressChartComponent } from './utils/shared/pieces-progress-chart/pieces-progress-chart.component';

import { NextOrdersModalComponent } from './utils/shared/next-orders-modal/next-orders-modal.component';

import { MachineStatusReportChartComponent } from './utils/shared/machine-status-report-chart/machine-status-report-chart.component';


import { DeleteModalConfirmComponent } from './utils/shared/delete-modal-confirm/delete-modal-confirm.component';


import { UploadComponent } from './utils/upload/upload.component';
import { FileValidator } from './utils/upload/file-input.validator';
import { FileValueAccessor } from './utils/upload/file-control-value.accessor'


import { BatchModalComponent } from './utils/shared/batch-modal/batch-modal.component';
import { BatchDetailsModalComponent } from './utils/shared/batch-modal/batch-details-modal/batch-details-modal.component';
import { BatchParametersModalComponent } from './utils/shared/batch-modal/batch-parameters-modal/batch-parameters-modal.component';
import { BatchParameterChangesModalComponent } from './utils/shared/batch-modal/batch-parameters-modal/batch-parameter-changes-modal/batch-parameter-changes-modal.component';
import { BatchQualityModalComponent } from './utils/shared/batch-modal/batch-quality-modal/batch-quality-modal.component';
import { BatchQualityReportModalComponent } from './utils/shared/batch-modal/batch-quality-modal/batch-quality-report-modal/batch-quality-report-modal.component';
import { BatchDowntimeModalComponent } from './utils/shared/batch-modal/batch-downtime-modal/batch-downtime-modal.component';
import { BatchDateTimePickerComponent } from './utils/shared/batch-date-time-picker/batch-date-time-picker.component';


import { MatNativeDateModule } from '@angular/material/core';
import {MatChipsModule} from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MaterialTeamSelectComponent } from './utils/material/material-team-select/material-team-select.component';
import { NgxSpinnerComponent } from './utils/material/ngx-spinner/ngx-spinner.component';
import { SaveModalConfirmComponent } from './utils/shared/save-modal-confirm/save-modal-confirm.component';
import { SaveRecipeModalConfirmComponent } from './utils/shared/save-recipe-modal-confirm/save-recipe-modal-confirm.component';
import { SelectWithFlag } from './custom-form-components/select-with-flag/select-with-flag';
import { FiveDigitInput } from './custom-form-components/five-digit-input/five-digit-input';
// import { ServerNotificationsService } from './utils/services/server-notifications.service';
import {TranslateModule} from '@ngx-translate/core';
import { DropdownDateTimeComponent } from './utils/shared/dropdown-filter/dropdown-filter.component';
import { TextInput } from './custom-form-components/text-input/text-input';
import { AdjustOrderPiecesModalComponent } from './utils/shared/adjust-order-pieces/adjust-order-pieces-modal.component';
import { EditOrderTargetPiecesModalComponent } from './utils/shared/edit-order-target-pieces/edit-order-target-pieces-modal.component';

import { ScatterChartComponent } from './utils/shared/scatter-chart/scatter-chart.component';
import {ReportOEEDetailsTableTeamsSummary } from './utils/shared/report-oee-details-table-teams-summary/report-oee-details-table-teams-summary';
import { TimePickerComponent } from './utils/shared/time-picker/time-picker.component';

import { DxButtonModule, DxDataGridModule, DxProgressBarModule, DxTreeListModule } from 'devextreme-angular';
import { InfoModalComponent } from './utils/shared/info-modal/info-modal.component';
import { SelectProcessCellComponent } from './utils/shared/select-process-cell-modal/select-process-cell-modal.component';
import { OeeBadgeStatusComponent } from './utils/shared/oee-badge-status/oee-badge-status.component';
import { MachinesSpeedModalComponent } from './utils/shared/line-status-chart/machines-speed-modal/machines-speed-modal.component';
import { SmoothedLineChartComponent } from './utils/shared/smoothed-line-chart/smoothed-line-chart.component';
import { LiveDataModalComponent } from './utils/shared/live-data-modal/live-data-modal.component';
import { MachineHistoryChartComponent } from './utils/shared/machine-history-chart/machine-history-chart.component';
import { MachineActualStatusComponent } from './utils/shared/machine-actual-status/machine-actual-status.component';
import { MachineStatusHistoryChartComponent } from './utils/shared/machine-status-history/machine-status-history-chart.component';
import { MachineStatusAnalysisChartComponent } from './utils/shared/machine-status-analysis-chart/machine-status-analysis-chart.component';
import { RealtimeTabComponent } from './utils/shared/realtime-tab/realtime-tab.component';
import { OeeCardComponent } from './utils/shared/oee-components/oee-card/oee-card.component';
import { OEEChartComponent } from './utils/shared/oee-components/OEE-chart/oee-chart.component';
import { OeeDetailsModalComponent } from './utils/shared/oee-components/OEE-chart/oee-details-modal/oee-details-modal.component';
import { AvailabilityCardComponent } from './utils/shared/oee-components/availability-card/availability-card.component';
import { PerformanceCardComponent } from './utils/shared/oee-components/performance-card/performance-card.component';
import { AvailabilityDetailsModalComponent } from './utils/shared/oee-components/availability-chart/Details/availability-details-modal.component';
import { AvailabilityChartComponent } from './utils/shared/oee-components/availability-chart/availability-chart.component';
import { QualityCardComponent } from './utils/shared/oee-components/quality-card/quality-card.component';
import { PerformanceChartComponent } from './utils/shared/oee-components/performance-chart/performance-chart.component';
import { PerformanceDetailsModal } from './utils/shared/oee-components/performance-chart/Details/performance-details-modal.component';
import { QualityChartComponent } from './utils/shared/oee-components/quality-chart/quality-chart.component';
import { ReportQualityDetailsModalComponent } from './utils/shared/oee-components/quality-chart/report-quality-details-modal/report-quality-details-modal.component';
import { MachineStatusHistoryModalComponent } from './utils/shared/machine-status-history-modal/machine-status-history-modal.component';
import { MachineHistoryCardComponent } from './utils/shared/machine-history-card/machine-history-card.component';
import { MachineHistoryDetailCardComponent } from './utils/shared/machine-history-card/machine-history-detail-card/machine-history-detail-card.component';
import { LiveDataCardComponent } from './utils/shared/live-data-card/live-data-card.component';
import { AlarmSummaryCardComponent } from './utils/shared/alarm-summary-card/alarm-summary-card.component';
import { DowntimeAlarmCardComponent } from './utils/shared/downtime-alarm-card/downtime-alarm-card.component';
import { EndLineSpeedCardComponent } from './utils/shared/end-line-speed-card/end-line-speed-card.component';
import { AlarmSummaryDetailCardComponent } from './utils/shared/alarm-summary-card/alarm-summary-detail-card/alarm-summary-detail-card.component';
import { DowntimeAlarmDetailCardComponent } from './utils/shared/downtime-alarm-card/downtime-alarm-detail-card/downtime-alarm-detail-card.component';
import { ReportOEEDetailsTableOrders } from './utils/shared/report-oee-details-table-orders/report-oee-details-table-orders';
import { ReportOEEDetailsTableTeams } from './utils/shared/report-oee-details-table-teams/report-oee-details-table-teams';
import { BrowserModule } from '@angular/platform-browser';
import {MatTooltipModule} from '@angular/material/tooltip';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AlarmChartComponent } from './utils/shared/alarm-chart/alarm-chart.component';
import { NbMomentDateModule } from '@nebular/moment';
import { DatePickerComponent } from './utils/shared/date-picker/date-picker.component';
import { MultiLineSpeedChartComponent } from './utils/shared/multi-line-speed-chart/multi-line-speed-chart.component';
import { LineSpeedChartComponent } from './utils/shared/line-speed-chart/line-speed-chart.component';
import { DownloadPdfConfirmComponent } from './utils/shared/download-pdf-confirm/download-pdf-confirm.component';

const PIPES = [
  CapitalizePipe,
  PluralPipe,
  LocalDatePipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
  SecondsToDurationPipe,
  HoursToDaysPipe,
  TicksToDurationPipe,
  DateFormatPipe,
  RemoveCommaPipe
];

const materialModules = [
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatRadioModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatBadgeModule,
  MatProgressSpinnerModule,
  MatChipsModule,
];

@NgModule({
  imports: [
    AngularKdsLibraryModule,
    MatTooltipModule,
    NbTooltipModule,
    NbCardModule,
    NbButtonModule,
    NbTabsetModule,
    NbDatepickerModule,
    // NbTimepickerModule.forRoot(),
    NbInputModule,
    NbIconModule,
    NbBadgeModule,
    NbRadioModule,
    NbAlertModule,
    NbTimepickerModule,
    NbSpinnerModule,
    DataTablesModule,
    NbMomentDateModule,
    ChartModule,
    DxButtonModule,
    DxProgressBarModule,
    DxTreeListModule,
    DxDataGridModule,
    FormlyModule.forRoot({
      types: [
        { name: 'input-with-flag', component: InputWithFlag },
        { name: 'radio-with-flag', component: RadioWithFlag },
        { name: 'connected-checkbox', component: ConnectedCheckbox },
        { name: 'select-with-flag', component: SelectWithFlag },
        { name: 'five-digit-input', component: FiveDigitInput },
        { name: 'text-input', component: TextInput},
        { name: 'tabs', component: FormFieldTabs },
      ],
      extras: { lazyRender: true }}),
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      ...materialModules,
      // // TranslateModule.forRoot(),
      // TranslateModule.forRoot({
      //   loader: {
      //     provide: TranslateLoader,
      //     useFactory: HttpLoaderFactory,
      //     deps: [HttpClient]
      //   }
      // })
      TranslateModule
    ],
    exports: [
      ...PIPES,
      UploadComponent,
      ServerNotificationsComponent,
      DowntimeReasonsComponent,
      DowntimeAlarmsComponent,
      MachineHistoryChartComponent,
      AlarmsSummaryComponent,
      AlarmChartComponent,
      NextOrdersModalComponent,
      MachineDowntimeComponent,
      MachinePerformanceComponent,
      LinePerformanceByHoursComponent,
      DowntimeAlarmsDetailsChartComponent,
      AlarmsTimelineChartComponent,
      MachineStatusReportChartComponent,
      MachineStatusHistoryChartComponent,
      DeleteModalConfirmComponent,
      SelectProcessCellComponent,
      InfoModalComponent,
      AdjustOrderPiecesModalComponent,
      EditOrderTargetPiecesModalComponent,
      SaveModalConfirmComponent,
      SaveRecipeModalConfirmComponent,
      SelectLineComponent,
      ProgressBarComponent,
      ButtonsToggleComponent,
      QualityCheckFormComponent,
      PiecesProgressChartComponent,
      MaterialSelectComponent,
      MaterialSelectParametersComponent,
      MaterialMultipleSelectComponent,
      MaterialTeamSelectComponent,
      NgxSpinnerComponent,
      MaterialButtonsComponent,
      SelectWithFlag,
      ScatterChartComponent,
      ReportOEEDetailsTableTeams,
      ReportOEEDetailsTableOrders,
      ReportOEEDetailsTableTeamsSummary,
      OeeBadgeStatusComponent,
      OEEChartComponent,
      MachineOeeChartComponent,
      LineStatusChartComponent,
      MachinesStatusHistoryChartComponent,
      MachinesStatusChartComponent,
      LineStatusModalComponent,
      MachineSpeedChartComponent,
      MachineDataDetailsComponent,
      OeeDetailsModalComponent,
      AvailabilityDetailsModalComponent,
      AvailabilityChartComponent,
      PerformanceChartComponent,
      TimePickerComponent,
      DatePickerComponent,
      PerformanceDetailsModal,
      QualityChartComponent,
      ReportQualityDetailsModalComponent,
      RoutingMasterOptionalComponent,
      ProductsQualityRangeParameterComponent,
      ProductsQualityTypeParameterComponent,
      ProductsRoutingParameterComponent,
      ProductsWorkingParameterComponent,
      ProductsMandatoryParameterSpeedComponent,
      ProductsMandatoryParameterUnitConversionComponent,
      CalendarQualityRangeParameterComponent,
      CalendarQualityTypeParameterComponent,
      CalendarRoutingParameterComponent,
      CalendarWorkingParameterComponent,
      CalendarMandatoryParameterSpeedComponent,
      CalendarMandatoryParameterUnitConversionComponent,
      TranslateModule,
      BatchModalComponent,
      BatchDetailsModalComponent,
      BatchParametersModalComponent,
      BatchParameterChangesModalComponent,
      BatchQualityModalComponent,
      BatchQualityReportModalComponent,
      BatchDowntimeModalComponent,
      BatchDateTimePickerComponent,
      DropdownDateTimeComponent,
      SmoothedLineChartComponent,
      MachinesSpeedModalComponent,
      LiveDataModalComponent,
      MachineStatusHistoryModalComponent,
      MachineStatusAnalysisChartComponent,
      MachineActualStatusComponent,
      RealtimeTabComponent,
      OeeCardComponent,
      AvailabilityCardComponent,
      PerformanceCardComponent,
      QualityCardComponent,
      MachineHistoryCardComponent,
      MachineHistoryDetailCardComponent,
      LiveDataCardComponent,
      AlarmSummaryCardComponent,
      DowntimeAlarmCardComponent,
      EndLineSpeedCardComponent,
      AlarmSummaryDetailCardComponent,
      DowntimeAlarmDetailCardComponent,
      MultiLineSpeedChartComponent,
      LineSpeedChartComponent,
      DownloadPdfConfirmComponent,
      // ,
    ],
    providers: [
      // ServerNotificationsService,
      { provide: NB_TIME_PICKER_CONFIG, useValue: {}},
    ],
    declarations: [
      ...PIPES,
      RadioWithFlag,
      InputWithFlag,
      ConnectedCheckbox,
      FormFieldTabs,
      UploadComponent,
      FileValidator,
      FileValueAccessor,
      ServerNotificationsComponent,

      SelectLineComponent,
      ProgressBarComponent,
      ButtonsToggleComponent,
      QualityCheckFormComponent,

      MaterialSelectComponent,
      MaterialSelectParametersComponent,
      MaterialMultipleSelectComponent,
      MaterialTeamSelectComponent,
      NgxSpinnerComponent,
      MaterialButtonsComponent,
      SelectWithFlag,
      FiveDigitInput,
      TextInput,
      ScatterChartComponent,
      ReportOEEDetailsTableTeams,
      ReportOEEDetailsTableTeamsSummary,
      ReportOEEDetailsTableOrders,
      OEEChartComponent,
      MachineOeeChartComponent,
      LineStatusChartComponent,
      OeeDetailsModalComponent,
      AvailabilityDetailsModalComponent,
      MachinesStatusHistoryChartComponent,
      MachinesStatusChartComponent,
      LineStatusModalComponent,
      MachineSpeedChartComponent,
      MachineDataDetailsComponent,
      AvailabilityChartComponent,
      PerformanceChartComponent,
      TimePickerComponent,
      DatePickerComponent,
      PerformanceDetailsModal,
      QualityChartComponent,
      ReportQualityDetailsModalComponent,
      NextOrdersModalComponent,
      DowntimeReasonsComponent,
      DowntimeAlarmsComponent,
      MachineHistoryChartComponent,
      AlarmsSummaryComponent,
      AlarmChartComponent,
      MachineDowntimeComponent,
      MachinePerformanceComponent,
      LinePerformanceByHoursComponent,
      DowntimeAlarmsDetailsChartComponent,
      AlarmsTimelineChartComponent,
      MachineStatusReportChartComponent,
      MachineStatusHistoryChartComponent,
      DeleteModalConfirmComponent,
      SelectProcessCellComponent,
      InfoModalComponent,
      AdjustOrderPiecesModalComponent,
      EditOrderTargetPiecesModalComponent,
      SaveModalConfirmComponent,
      SaveRecipeModalConfirmComponent,
      PiecesProgressChartComponent,
      RoutingMasterOptionalComponent,
      ProductsQualityRangeParameterComponent,
      ProductsQualityTypeParameterComponent,
      ProductsRoutingParameterComponent,
      ProductsWorkingParameterComponent,
      ProductsMandatoryParameterSpeedComponent,
      ProductsMandatoryParameterUnitConversionComponent,
      CalendarQualityRangeParameterComponent,
      CalendarQualityTypeParameterComponent,
      CalendarRoutingParameterComponent,
      CalendarWorkingParameterComponent,
      CalendarMandatoryParameterSpeedComponent,
      CalendarMandatoryParameterUnitConversionComponent,
      BatchModalComponent,
      BatchDetailsModalComponent,
      BatchParametersModalComponent,
      BatchParameterChangesModalComponent,
      BatchQualityModalComponent,
      BatchQualityReportModalComponent,
      BatchDowntimeModalComponent,
      BatchDateTimePickerComponent,
      DropdownDateTimeComponent,
      OeeBadgeStatusComponent,
      SmoothedLineChartComponent,
      MachinesSpeedModalComponent,
      LiveDataModalComponent,
      MachineStatusHistoryModalComponent,
      MachineStatusAnalysisChartComponent,
      MachineActualStatusComponent,
      RealtimeTabComponent,
      OeeCardComponent,
      AvailabilityCardComponent,
      PerformanceCardComponent,
      QualityCardComponent,
      MachineHistoryCardComponent,
      MachineHistoryDetailCardComponent,
      LiveDataCardComponent,
      AlarmSummaryCardComponent,
      DowntimeAlarmCardComponent,
      EndLineSpeedCardComponent,
      AlarmSummaryDetailCardComponent,
      DowntimeAlarmDetailCardComponent,
      MultiLineSpeedChartComponent,
      LineSpeedChartComponent,
      DownloadPdfConfirmComponent,
  ],
})

export class SharedModule { }

