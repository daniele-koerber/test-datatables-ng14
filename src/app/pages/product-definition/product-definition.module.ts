import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
// import { NbDateFnsDateModule } from '@nebular/date-fns';
import { NbCardModule, NbButtonModule, NbIconModule, NbSpinnerModule } from '@nebular/theme';
import { ProductDefinitionComponent } from './product-definition.component';
import { ProductDetailsFullComponent } from './product-details-full/product-details.component';
import { ProductDetailsSmallComponent } from './product-details-small/product-details.component';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductDetailsCardComponent } from './product-details-card/product-details-card.component';

import { SharedModule } from '../../@core/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NbCardModule,
    // NbDateFnsDateModule,
    NbButtonModule,
    NbIconModule,
    // NbTimepickerModule.forRoot(),
    SharedModule,
    MatCheckboxModule,
    MatInputModule,
    NbSpinnerModule,
    // NgbModule,
  ],
  declarations: [
    ProductDefinitionComponent,
    ProductDetailsFullComponent,
    ProductDetailsSmallComponent,
    ProductDetailsCardComponent,
    // QualityRangeParameterComponent,
    // QualityTypeParameterComponent,
    // RoutingParameterComponent,
    // WorkingParameterComponent,
    // MandatoryParameterSpeedComponent,
  ],
  providers: [],
})
export class ProductDefinitionModule { }
