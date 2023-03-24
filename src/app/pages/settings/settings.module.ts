import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule, NbIconModule } from '@nebular/theme';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../../@core/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  declarations: [
    SettingsComponent,
  ],
  providers: [],
})
export class SettingsModule { }
