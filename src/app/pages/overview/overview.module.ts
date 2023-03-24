
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { NbCardModule, NbStepperModule, NbButtonModule, NbAlertModule, NbBadgeModule, NbIconModule, NbRadioModule, NbSpinnerModule } from '@nebular/theme';

import { DataTablesModule } from 'angular-datatables';
import { OverviewComponent } from './overview.component';
import { ActualOrderCardComponent } from './actual-order-card/actual-order-card.component';
import { LineStatusCardComponent } from './line-status-card/line-status-card.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedModule } from '../../@core/shared.module';


import { MachineStatusCardComponent } from './machine-status-card/machine-status-card.component';
import { NotificationsCardComponent } from './notifications-card/notifications-card.component';
import { QualityCheckFormModalComponent } from './notifications-card/quality-check-modal/quality-check-modal-form/quality-check-modal-form.component';
import { DowntimeAcknowledgeModalFormComponent } from './notifications-card/downtime-acknowledge-modal/downtime-acknowledge-modal-form/downtime-acknowledge-modal-form.component';
import { MomAlarmsButtonComponent } from './notifications-card/mom-alarms-button/mom-alarms-button.component';
import { QualityCheckButtonComponent } from './notifications-card/quality-check-button/quality-check-button.component';
import { DowntimeAcknowledgeButtonComponent } from './notifications-card/downtime-acknowledge-button/downtime-acknowledge-button.component';
import { MomAlarmsModalComponent } from './notifications-card/mom-alarms-modal/mom-alarms-modal.component';
import { QualityCheckListComponent } from './notifications-card/quality-check-modal/quality-check-list/quality-check-list.component';
import { DowntimeAcknowledgeModalComponent } from './notifications-card/downtime-acknowledge-modal/downtime-acknowledge-modal.component';
import { QualityCheckModalComponent } from './notifications-card/quality-check-modal/quality-check-modal.component';
import { ActualShiftCardComponent } from './current-shift-card/current-shift-card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: OverviewComponent
      }
    ]),
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    NbCardModule,
    NbSpinnerModule,
    NbStepperModule,
    NbButtonModule,
    NbAlertModule,
    NbBadgeModule,
    NbIconModule,
    NbRadioModule,
    DataTablesModule,
    SharedModule,
    MatStepperModule,
    MatButtonModule,
    MatBadgeModule,
    MatRadioModule,
    MatFormFieldModule,
  ],
  declarations: [
    OverviewComponent,
    ActualOrderCardComponent,
    NotificationsCardComponent,
    LineStatusCardComponent,
    ActualShiftCardComponent,
    DowntimeAcknowledgeModalComponent,
    QualityCheckModalComponent,
    QualityCheckListComponent,
    MomAlarmsModalComponent,
    DowntimeAcknowledgeButtonComponent,
    QualityCheckButtonComponent,
    MomAlarmsButtonComponent,
    DowntimeAcknowledgeModalFormComponent,
    QualityCheckFormModalComponent,
    MachineStatusCardComponent,
  ],
  providers: [],
})
export class OverviewModule { }



