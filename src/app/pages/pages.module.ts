import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { ConfigurationService } from '../@core/mock/configuration.service';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { SettingsModule } from './settings/settings.module';
import { CalendarModule } from './calendar/calendar.module';
import { ReportModule } from './report/report.module';

import { ProductDefinitionModule } from './product-definition/product-definition.module';



@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    SettingsModule,
    CalendarModule,
    ProductDefinitionModule,
    ReportModule
  ],
  declarations: [
    PagesComponent
  ],
  providers: [
    ConfigurationService
  ]
})
export class PagesModule {
}
