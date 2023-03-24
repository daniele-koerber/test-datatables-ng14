import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbAuthModule, NbPasswordAuthStrategy } from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { of as observableOf } from 'rxjs';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { catchError, map } from 'rxjs/operators';
import { RippleService } from './utils/services/ripple.service';
import { NbAuthJWTToken, NbAuthResult } from '@nebular/auth';
import {TranslateService} from '@ngx-translate/core';
import {
  AnalyticsService,
  LayoutService,
  PlayerService,
  SeoService,
  StateService,
  SessionService,
  ConfigService,
  AuthGuardService,
  SignalRNotificationService,
} from './utils/services';
import { DynamicFormsData } from './data/dynamic-forms';
import { ConfigurationData } from './data/configuration';
import { TimeSeriesDatabaseData } from './data/timeSeriesDatabase';
import { DowntimeData } from './data/downtime';
import { QualityData } from './data/quality';
import { SchedulingData } from './data/scheduling';
import { ParametersData } from './data/parameters';
import { IntegrationData } from './data/integration';
import { ExportWorkerData } from './data/exportworker';
import { ApiGatewayData } from './data/apigateway';
import { SmartTableData } from './data/smart-table';


import { DynamicFormsService } from './mock/dynamic-forms.service';
import { ConfigurationService } from './mock/configuration.service';
import { TimeSeriesDatabaseService } from './mock/timeSeriesDatabase.service';
import { DowntimeService } from './mock/downtime.service';
import { QualityService } from './mock/quality.service';
import { SchedulingService } from './mock/scheduling.service';
import { IntegrationService } from './mock/integration.service';
import { ApiGatewayService } from './mock/apigateway.service';
import { ExportWorkerService } from './mock/exportworker.service';
import { SmartTableService } from './mock/smart-table.service';
import { ParametersService } from './mock/parameters.service';
import { MockDataModule } from './mock/mock-data.module';

const formSetting: any = {
  redirectDelay: 0,
  showMessages: {
    success: true,
  },
};

let translate: TranslateService;
const configService = new ConfigService(translate);

const keycloak_config = sessionStorage.getItem('keycloak_config') ?
  JSON.parse(sessionStorage.getItem('keycloak_config')) : null;
const keycloak_baseEndpoint = `${keycloak_config?.KEYCLOAK_URL}`;
const currentLocation = window.location.href;

const DATA_SERVICES = [
  { provide: ConfigurationData, useClass: ConfigurationService },
  { provide: TimeSeriesDatabaseData, useClass: TimeSeriesDatabaseService },
  { provide: DowntimeData, useClass: DowntimeService },
  { provide: QualityData, useClass: QualityService },
  { provide: SchedulingData, useClass: SchedulingService },
  { provide: ParametersData, useClass: ParametersService },
  { provide: IntegrationData, useClass: IntegrationService },
  { provide: ExportWorkerData, useClass: ExportWorkerService },
  { provide: ApiGatewayData, useClass: ApiGatewayService },
  { provide: DynamicFormsData, useClass: DynamicFormsService },
  { provide: SmartTableData, useClass: SmartTableService },

  { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useExisting: RippleService },
];

class NbMomPasswordAuthStrategy extends NbPasswordAuthStrategy {
  authenticate(data) {

    const self = this;
      const module = 'login';
      const url = this.getActionEndpoint(module);
      const requireValidToken = this.getOption(`${module}.requireValidToken`);

      return this.http.post(url, {})
      .pipe(
        map(res => {
          const authResult = new NbAuthResult(true,
            res,
            this.getOption(`${module}.redirect.success`),
            [],
            this.getOption('messages.getter')(module, res, this.options),
            this.createToken(this.getOption('token.getter')(module, res, this.options), requireValidToken),
          );
          return authResult;
        }),
        catchError((err) => {
          return this.handleResponseError(err, module);
        }),
      );
  }

  getWelcomePage (WhoAmIResult) {

    let welcomePage = '';
    if (WhoAmIResult) {
      const featuresList = WhoAmIResult.WhoAmIResult.FeaturePersonnelClass.FeaturesList;

      const isDashboardPageEnabled = featuresList.find(feat => feat.FeatureCode === 'canManageEverything')
        || featuresList.find(feat => feat.FeatureCode === 'canManageDashboard');
      const isOrdersPageEnabled = featuresList.find(feat => feat.FeatureCode === 'canManageOrders');
      const isOperationsPageEnabled = featuresList.find(feat => feat.FeatureCode === 'canManageOperations')
        || featuresList.find(feat => feat.FeatureCode === 'canExecuteMaintenanceOperations');


      if (isOperationsPageEnabled) { welcomePage = '/pages/operations'; }
      if (isOrdersPageEnabled) { welcomePage = '/pages/orders'; }
      if (isDashboardPageEnabled) { welcomePage = '/pages/dashboard'; }
    }
    return welcomePage;
  }
}

export class NbSimpleRoleProvider extends NbRoleProvider {
  getRole() {
    // here you could provide any role based on any auth flow
    return observableOf('guest');
  }
}

export const NB_CORE_PROVIDERS = [
  ...MockDataModule.forRoot().providers,
  ...DATA_SERVICES,
  ...NbAuthModule.forRoot({

    strategies: [
      NbMomPasswordAuthStrategy.setup({
        name: 'email',
        baseEndpoint: keycloak_baseEndpoint,
        token: {
          key: 'access_token', // this parameter tells where to look for the token
          class: NbAuthJWTToken,
        },
        logout: {
        },
      }),
    ],
    forms: {
      login: formSetting,
      register: formSetting,
      resetPassword: formSetting,
      logout: {
        redirectDelay: 0,
      },
      validation: {
        password: {
          minLength: 2,
        },
      },
    },
  }).providers,

  NbSecurityModule.forRoot({
    accessControl: {
      guest: {
        view: '*',
      },
      user: {
        parent: 'guest',
        create: '*',
        edit: '*',
        remove: '*',
      },
    },
  }).providers,

  {
    provide: NbRoleProvider, useClass: NbSimpleRoleProvider,
  },
  AnalyticsService,
  LayoutService,
  PlayerService,
  SeoService,
  StateService,
  SessionService,
  ConfigService,
  AuthGuardService,
  SignalRNotificationService,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    NbAuthModule,
  ],
  declarations: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
      ],
    };
  }
}
