import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuardService } from '../@core/utils/services/auth-guard.service';
import { PagesComponent } from './pages.component';

import { ProductDefinitionComponent } from './product-definition/product-definition.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ReportComponent } from './report/report.component';
import { ReportDetailsComponent } from './report/report-details/report-details.component';
import { SettingsComponent } from './settings/settings.component';

import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'overview',
      canActivate: [AuthGuardService],
      // component: OverviewComponent,
      loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule)
    },
    {
      path: 'product-definition',
      canActivate: [AuthGuardService],
      component: ProductDefinitionComponent,
    },
    {
      path: 'calendar',
      canActivate: [AuthGuardService],
      component: CalendarComponent,
    },
    {
      path: 'report',
      canActivate: [AuthGuardService],
      component: ReportComponent,
    },
    {
      path: 'report-details',
      canActivate: [AuthGuardService],
      component: ReportDetailsComponent,
    },
    {
      path: 'settings',
      canActivate: [AuthGuardService],
      component: SettingsComponent
    },

    {
      path: '',
      redirectTo: 'overview',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
