import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbDatepickerModule, NbIconModule, NbTabsetModule, NbTimepickerModule, NB_TIME_PICKER_CONFIG, NbInputModule } from '@nebular/theme';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DataTablesModule } from 'angular-datatables';

import { ThemeModule } from '../../@theme/theme.module';

import { NbRadioModule, NbSpinnerModule } from '@nebular/theme';

import { SharedModule } from '../../@core/shared.module';
import { CalendarComponent } from './calendar.component';
import { OrdersModalComponent } from './orders-modal/orders-modal.component';
import { EditShiftDataModalComponent } from './edit-shift-data-modal/edit-shift-data-modal.component';
import { ShiftDetailsModalComponent } from './shift-details-modal/shift-details-modal.component';
import { PlanOrderModalComponent } from './plan-order-modal/plan-order-modal.component';
import { TeamDefinitionComponent } from './shift-definition-modal/team-definition/team-definition.component';
import { ImportExportShiftsModalComponent } from './import-export-shifts-modal/import-export-shifts-modal.component';
import { ImportShiftsModalComponent } from './import-export-shifts-modal/import-shifts-modal/import-shifts-modal.component';
import { ExportShiftsModalComponent } from './import-export-shifts-modal/export-shifts-modal/export-shifts-modal.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormlyModule } from '@ngx-formly/core';

import { DxButtonModule, DxDateBoxModule } from 'devextreme-angular';
import { DxColorBoxModule } from 'devextreme-angular';
import { EditShiftDefinitionComponent } from './shift-definition-modal/edit-shift-definition/edit-shift-definition.component';
import { ShiftDefinitionComponent } from './shift-definition-modal/shift-definition/shift-definition.component';
import { ShiftDefinitionModalComponent } from './shift-definition-modal/shift-definition-modal.component';
@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbTabsetModule,
    NbButtonModule,
    SharedModule,
    FullCalendarModule,
    DataTablesModule,
    MatSelectModule,
    NbRadioModule,
    NbSpinnerModule,
    MatInputModule,
    MatListModule,
    // secondstoTimePipe,
    MatIconModule,
    NbIconModule,
    MatRadioModule,
    NbDatepickerModule,
    FormlyModule,
    DxButtonModule,
    DxColorBoxModule,
    NbTimepickerModule,
    NbInputModule,
    DxDateBoxModule,
  ],
  declarations: [
    CalendarComponent,
    OrdersModalComponent,
    EditShiftDataModalComponent,
    ShiftDetailsModalComponent,
    PlanOrderModalComponent,
    ShiftDefinitionModalComponent,
    ImportExportShiftsModalComponent,
    ImportShiftsModalComponent,
    ExportShiftsModalComponent,
    EditShiftDefinitionComponent,
    ShiftDefinitionComponent,
    TeamDefinitionComponent,
    // SecondstoTimePipe
  ],
  providers: [
    { provide: NB_TIME_PICKER_CONFIG, useValue: {}},
  ],
})
export class CalendarModule { }
