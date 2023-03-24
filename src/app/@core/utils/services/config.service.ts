import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

enum ServerNotificationTopics {
  Quality = 'Quality',
  Production = 'Production',
  Scheduling = 'Scheduling',
  Downtime = 'Downtime',
  Parameters = 'Parameters',
  Integration = 'Integration',
  ExportWorker = 'ExportWorker',
  ApiGateway = 'ApiGateway'
}

enum ParametersType {
  NotRecognized = 0,
  WorkingParameter = 1, // simple
  QualityRangeParameter = 2, // min max setpoint
  MandatoryParameterSpeed = 3, // simple
  MandatoryParamenterRouting = 4, // routing (machines array, multiple)
  QualityTypeParameter = 5, // select (types array, single)
  MandatoryParameterUnitConversion = 6,
}

enum COLORS {
  primary = '#0060ff',
  white = '#ffffff',
  black = '#262523',
  grey_1 = '#f5f3f1',
  grey_2 = '#e6e2dc',
  grey_3 = '#bfb8af',
  grey_4 = '#90887d',
  grey_5 = '#756f65',
  grey_6 = '#5b5543',
  grey_7 = '#3f3932',
  accent_1 = '#ffe32f',
  accent_2 = '#fec037',
  accent_3 = '#fe8623',
  accent_4 = '#ee532e',
  error = '#ce3800',
  success = '#00c013',
}

export enum BatchStatus {
  Planned = 0,
  Delayed = 1,
  ActiveOnTime = 2,
  ActiveDelayed = 3,
  Completing = 4,
  Completed = 5,
  Paused = 6
}

enum BatchStatusColor {
  Planned = COLORS.primary,
  Delayed = COLORS.accent_4,
  ActiveOnTime = COLORS.success,
  ActiveDelayed = COLORS.success,
  Completing = COLORS.success,
  Completed = COLORS.grey_5,
  Paused = COLORS.accent_3,
}

enum OrderStatus {
  New = 0,
  Validating = 1,
  NotScheduled = 2,
  Scheduled = 3,
  Active = 4,
  Error = 5,
}

enum ValidationColor {
  Valid = COLORS.success,
  Error = COLORS.error,
}

export enum MachineStatus {
  Undefined = 0,
  Idle = 4,
  Suspended = 5,
  Execute = 6,
  Held = 11,
  Completing = 16,
  Starved = 50,
  Blocked = 51,
}

enum machineStatusColor {
  Execute = COLORS.success,
  Held = COLORS.error,
  Suspended = COLORS.accent_1,
  Completing = COLORS.primary,
  Idle = COLORS.grey_2,
  Unknown = COLORS.black,
  Undefined = COLORS.black,
  Starved = COLORS.accent_2,
  Blocked = COLORS.accent_3,
}

enum OrderStatusColor {
  New = COLORS.primary,
  Validating = COLORS.accent_2,
  NotScheduled = COLORS.accent_2,
  Scheduled = COLORS.primary,
  Active = COLORS.success,
  Error = COLORS.error,
}

@Injectable({ providedIn: 'root' })

export class ConfigService {
  private languages = [ // app.module.ts needs also to be updated
    {key:"en", value: "English"},
    {key: "it", value: "Italiano"},
    {key: "es", value: "Español"}
  ]; 
  private locales = ["en-US", "it-IT",  "es-ES"];

  private helpPagesUrls = [
    { page: 'overview', url: {en:'overview', it:'overview'}},
    { page: 'product-definition', url: {en:'product-definition' , it:'definizione-prodotto' }},
    { page: 'calendar', url: {en:'calendar' , it:'calendario' }},
    { page: 'report', url: {en:'oee-reports-chart' , it:'oee-reports-chart' }},
    { page: 'report-details_order', url: {en:'order-report-details' , it:'dettagli-report' }},
    { page: 'report-details_shift', url: {en:'shift-report-details' , it:'dettagli-report' }},
    { page: 'settings', url: {en:'settings' , it:'impostazioni' }},

    { page: 'batch-modal-details-calendar', url: {en:'order-details', it:'dettagli-ordine'}},
    { page: 'batch-modal-details', url: {en:'order-details', it:'dettagli-ordine'}},
    { page: 'batch-modal-parameters', url: {en:'parameters', it:'parametri'}},
    { page: 'batch-modal-OEE', url: {en:'oee', it:'oee'}},
    { page: 'batch-modal-quality', url: {en:'quality-checks', it:'moduli-qualita'}},
    { page: 'batch-modal-downtime', url: {en:'downtimes', it:'fermi-linea'}},

    { page: 'downtime-acknowledge-modal', url: {en:'downtimes-acknowledge', it:'fermi-linea'}},
    { page: 'quality-check-modal', url: {en:'quality-checks', it:'moduli-qualita'}},
    { page: 'mom-alarms-modal', url: {en:'active-errors', it:'active-errors'}},

    { page: 'alarms-summary', url: {en:'alarms-summary-chart', it:'grafico-riepilogo-allarmi'}},
    { page: 'adjust-order', url: {en:'#', it:'#'}},



    { page: 'availability-details-modal', url: {en:'availability-chart', it:'grafico-disponibilita'}},
    { page: 'performance-chart-details', url: {en:'performance-chart', it:'grafico-performance'}},

    { page: 'line-status_Machine_Status', url: {en:'machines-status-chart', it:'stato-linea' }},
    //*
    { page: 'line-status_Machine_Status_History', url: {en:'machines-status-history-chart', it:'stato-linea' }},
    //*

    { page: 'line-Machines_Status_in_Minutes', url: {en:'machines-status-in-minutes-chart', it:'grafico-stati-macchine-in-minuti' }},
    { page: 'line-status_Machine_Live_Data', url: {en:'live-data-chart', it:'grafico-dati-tempo-reale' }},

    { page: 'product-definition-edit', url: {en:'edit', it:'modifica' }},
    { page: 'product-definition-duplicate', url: {en:'duplicate', it:'duplica' }},
    { page: 'product-definition-addnew', url: {en:'add-new', it:'aggiungi-nuovo-prodotto' }},

    { page: 'oee-details-modal', url: {en:'oee', it:'oee' }},
    { page: 'order-quality-details-modal', url: {en:'quality-chart', it:'grafico-qualita' }},
    { page: 'plan-order-modal', url: {en:'plan-order-execution', it:'pianifica-esecuzione-ordine' }},
    { page: 'view-shift-report', url: {en:'view-shift-report', it:'Visualizza-il-rapporto-del-turno' }},

    { page: 'shift-quality-details-modal', url: {en:'quality-reporting-chart', it:'grafico-report-qualita' }},
    { page: 'report-quality-details-modal', url: {en:'quality-reporting-chart', it:'grafico-report-qualita' }},
    { page: 'next-orders-modal', url: {en:'next-orders', it:'prossimi-ordini' }},
    { page: 'quality-check-form', url: {en:'quality-check-form', it:'modulo-di-controllo-qualita' }},
    { page: 'batch-parameter-changes-modal', url: {en:'parameters', it:'parametri' }},
    { page: 'downtime-alarms-chart', url: {en:'downtimes', it:'modulo-di-giustificazione-del-fermo-linea' }},
    { page: 'report-oee-details-modal', url: {en:'machines-oee-chart', it:'grafico-report-oee' }},
    { page: 'edit-shift-data-modal', url: {en:'change-team-assignment', it:'cambia-team-assegnato' }},
    { page: 'import-export-shifts-modal', url: {en:'import-shifts', it:'importa-turni' }},
    { page: 'orders-modal', url: {en:'orders', it:'ordini' }},
    { page: 'shift-definition-modal', url: {en: 'shift-definition', it: 'definizione-turno' }},
    { page: 'downtime-acknowledge-modal-form', url: {en:'downtime-form', it:'modulo-di-giustificazione-del-fermo-linea' }},
    { page: 'product-details-small', url: {en:'order-report-details', it:'dettagli-report-dellordine' }},
    { page: 'downtime-report-table-modal', url: {en:'downtimes-summary', it:'riepilogo-fermi-linea' }},
    { page: 'quality-report-table-modal', url: {en:'quality-checks-summary', it:'riepilogo-moduli-qualita' }},
    { page: 'corrective-actions', url: {en:'corrective-actions', it:'azioni-correttive' }},
    { page: 'live-data-chart', url: {en:'live-data-chart', it:'grafico-dati-in-tempo-reale' }},
    { page: 'machine-status-details', url: {en:'machine-status-details', it:'dettagli-dello-stato-macchina' }},

    { page: 'line-status_batch-modal-details', url: {en:'machines-speed-chart', it:'grafico-velocita-macchine' }},
  ];

  private FEATURES_LIST = [
    { FeatureCode: 'CanStartStopProduction',        Description: 'Abilita I tasti nell’overview' },
    { FeatureCode: 'CanPauseProduction',            Description: 'Abilita I tasti pausa/resume nell’overview' },
    { FeatureCode: 'CanJusitifyDowntime',           Description: 'Abilita “pennina” per giustificare Il downtime' },
    { FeatureCode: 'CanFillQualityForm',            Description: 'Abilita “pennina” per compilare quality form' },
    { FeatureCode: 'CanEditParameters',             Description: 'Abilita editing campi “parameters” nella modale del batch (nel calendario)' },
    { FeatureCode: 'CanManageProductDefinition',    Description: 'Abilita pulsante “Add new”, “Delete” nel “product definition”' },
    { FeatureCode: 'CanEditShifts',                 Description: 'Abilita “edit shift” nel calendario' },
    { FeatureCode: 'CanOverrideShifts',             Description: 'Abilita “override shift” nel calendario' },
    { FeatureCode: 'CanDeleteOrders',               Description: 'Abilita pulsante “delete” in lista ordini nel calendario' },
    { FeatureCode: 'CanPlanOrder',                  Description: 'Abilita “plan order” nel calendario' },
    { FeatureCode: 'CanEditQualitySettings',        Description: 'Abilita gestione sezione quality in “Settings”, * abilita accesso a “Settings”' },
    { FeatureCode: 'CanExportData',                 Description: 'Abilita la possibilità di esportare i dati' },
    { FeatureCode: 'CanAdjustPieces',               Description: 'Abilita la possibilità di aggiungere/rimuovere pezzi dei conteggi' },
    { FeatureCode: 'CanManageUsers',                Description: 'Abilita gestione utenti' },
    { FeatureCode: 'CanViewOverviewPage',           Description: 'Abilita accesso a “Overview”' },
    { FeatureCode: 'CanViewProductDefinitionPage',  Description: 'Abilita accesso a “Product definition”' },
    { FeatureCode: 'CanViewCalendarPage',           Description: 'Abilita accesso a “Calendar”' },
    { FeatureCode: 'CanViewReportPage',             Description: 'Abilita accesso a “Report”' },
    { FeatureCode: 'CanBypassDisplayGroup',         Description: 'Se presente impostazione locale DisplayGroup, viene bypassata per mostrare tutte le macchine della configurazione”' },
    { FeatureCode: 'CanEditCalendarSettings',        Description: 'Abilita gestione sezione calendario in “Settings”, * abilita accesso a “Settings”' },
  ];

  private BASE_SERVER = '';
  private REST_API_SERVER = '';
  private IDENTITY_SERVER = '/identity/';
  private CONFIGURATION_SERVER = '/configuration/';
  private EXPORTWORKER_SERVER = '/exportworker/';
  private APIGATEWAY_SERVER = '/apigateway/';
  private DOWNTIME_SERVER = '/downtime/';
  private QUALITY_SERVER = '/quality/';
  private SCHEDULING_SERVER = '/scheduling/';
  private INTEGRATION_SERVER = '/integration/';
  private PARAMETERS_SERVER = '/parameters/';

  private TIME_SERIES_DATABASE = ':8086/';
  private TIME_SERIES_DATABASE_NAME = 'tMOMdb';
  private CMMS_URL = 'https://hoppr.koerber-tissue.com';
  private timedUpdateMs = 1000 * 60; // 1 minute
  private inactiveRefreshTime = 1000 * 60 * 20 // 20 minutes
  private SELECTED_LANGUAGE = '';

  private BADGE_THRESHOLD = 4;
  private numberOfRowsInsideModal = 8;
  private DOWNTIME_NOTIFICATIONS_SERVER;
  private QUALITY_NOTIFICATIONS_SERVER;
  private PARAMETERS_NOTIFICATIONS_SERVER;
  private INTEGRATION_NOTIFICATIONS_SERVER;
  private SCHEDULING_NOTIFICATIONS_SERVER;
  private EXPORTWORKER_NOTIFICATIONS_SERVER;
  private APIGATEWAY_NOTIFICATIONS_SERVER;
  private SIGNALR_SUBSCRIPTION_GROUP = "group";
  private SIGNALR_SUBSCRIPTION_GROUPS = "groups";
  private SIGNALR_SUBSCRIPTION_BROADCAST = "broadcast";

  private HELP_URL;
  private helpPageLinkDestination = '';
  private userSettingsPageLinkDestination = '';
  private userSettingsAdminPageLinkDestination = '';

  translatedBatchStatus = [];
  translatedOrderStatus = {};

  machineStatus = MachineStatus;

  constructor(
    public translate: TranslateService,
  ) {
    const url = require('../../../../assets/settings.json').BASE_SERVER;
    this.setBaseServerUrl(url);
  }

  getSelectedLanguage(): string {
    const localStoreValue = localStorage.getItem('selLanguage');
    const storedLanguage = (localStoreValue && localStoreValue !== 'undefined' && localStoreValue !== undefined ? JSON.parse(localStoreValue).key : null);
    const browserLang = this.translate.getBrowserLang();
    const languages = this.getLanguages().map(el => el.key);
    this.SELECTED_LANGUAGE =
      storedLanguage && languages.includes(storedLanguage) ? storedLanguage :
      browserLang && languages.includes(browserLang) ? browserLang :
      languages[0];
    const language = this.getLanguages().find(el=> el.key === this.SELECTED_LANGUAGE);
    this.setSelectedLanguage(language);
    if (this.SELECTED_LANGUAGE) { 
      this.HELP_URL = this.BASE_SERVER + '/tmomhelp/' + this.SELECTED_LANGUAGE + '/User%20Manuals/user-guide.html#'; // update help link
    }
    return this.SELECTED_LANGUAGE;
  }

  isBatchActive(batchStatus: BatchStatus): boolean {
    return (batchStatus === BatchStatus.Planned ||
            batchStatus === BatchStatus.Delayed ||
            batchStatus === BatchStatus.Completed
            ) ?
            false : true;
  }

  isBatchCompleted(batchStatus: BatchStatus): boolean {
    return (batchStatus === BatchStatus.Completed) ?
            true : false;
  }

  setSelectedLanguage(selectedLanguage) {
    if(selectedLanguage && selectedLanguage !== undefined) {
      localStorage.setItem('selLanguage', JSON.stringify(selectedLanguage));
    }
  }

  setAndUpdate(selectedLanguage) {
    this.setSelectedLanguage(selectedLanguage);
    window.location.reload();
  }

  getServerUrl() {
    return this.REST_API_SERVER;
  }

  getInactiveRefreshTime() {
    return this.inactiveRefreshTime;
  }

  translateBatchStatus() {
    const keysToTranslate = [...Object.keys(BatchStatus).filter(originalKey => {
      return !isNaN(Number(BatchStatus[originalKey]))
    })];

    this.translate.get(keysToTranslate.map((el) => `COMMON.${el}`)).subscribe((translations) => {
      this.translatedBatchStatus = translations;
    });
  }

  getTimedUpdateMs() {
    return this.timedUpdateMs;
  }

  translateOrderStatus() {
    const keysToTranslate = [...Object.keys(OrderStatus).filter(originalKey => {
      return !isNaN(Number(OrderStatus[originalKey]))
    })];

    this.translate.get(keysToTranslate.map((el) => `COMMON.${el}`)).subscribe((translations) => {
      this.translatedOrderStatus = translations;
    });
  }

  getNotificationsUrl(service) {
    let url: string;
    switch (service) {
      case ServerNotificationTopics.Downtime:
        url = this.DOWNTIME_NOTIFICATIONS_SERVER;
      break;
      case ServerNotificationTopics.Quality:
        url = this.QUALITY_NOTIFICATIONS_SERVER;
      break;
      case ServerNotificationTopics.Parameters:
        url = this.PARAMETERS_NOTIFICATIONS_SERVER;
      break;
      case ServerNotificationTopics.Integration:
        url = this.INTEGRATION_NOTIFICATIONS_SERVER;
      break;
      case ServerNotificationTopics.Scheduling:
        url = this.SCHEDULING_NOTIFICATIONS_SERVER;
      break;
      case ServerNotificationTopics.ApiGateway:
        url = this.APIGATEWAY_NOTIFICATIONS_SERVER;
      break;
      case ServerNotificationTopics.ExportWorker:
        url = this.EXPORTWORKER_NOTIFICATIONS_SERVER;
      break;
      default:
        url = null;
      break;
    }
    return url;
  }

  getBadgeThreshold() {
    return this.BADGE_THRESHOLD;
  }

  setBaseServerUrl(url) {
    this.BASE_SERVER = url;
    this.HELP_URL = this.BASE_SERVER + '/tmomhelp/User%20Manuals/user-guide.html#';
    this.DOWNTIME_NOTIFICATIONS_SERVER = this.BASE_SERVER + this.DOWNTIME_SERVER + 'notifications';
    this.QUALITY_NOTIFICATIONS_SERVER = this.BASE_SERVER + this.QUALITY_SERVER + 'notifications';
    this.PARAMETERS_NOTIFICATIONS_SERVER = this.BASE_SERVER + this.PARAMETERS_SERVER + 'notifications';
    this.INTEGRATION_NOTIFICATIONS_SERVER = this.BASE_SERVER + this.INTEGRATION_SERVER + 'notifications';
    this.SCHEDULING_NOTIFICATIONS_SERVER = this.BASE_SERVER + this.SCHEDULING_SERVER + 'notifications';
    this.EXPORTWORKER_NOTIFICATIONS_SERVER = this.BASE_SERVER + this.EXPORTWORKER_SERVER + 'notifications';
    this.APIGATEWAY_NOTIFICATIONS_SERVER = this.BASE_SERVER + this.APIGATEWAY_SERVER + 'notifications';

    const keycloak_config = sessionStorage.getItem('keycloak_config') ? JSON.parse(sessionStorage.getItem('keycloak_config')) : null;
    this.userSettingsPageLinkDestination = `${keycloak_config?.KEYCLOAK_URL}/realms/${keycloak_config?.KEYCLOAK_REALM}/account/`;
    this.userSettingsAdminPageLinkDestination = `${keycloak_config?.KEYCLOAK_URL}/admin/${keycloak_config?.KEYCLOAK_REALM}/console/#/realms/${keycloak_config?.KEYCLOAK_REALM}/users`;
  }

  checkDomain(url) { 
    if(url.hostname !== 'localhost') { this.setBaseServerUrl(url.protocol + '//' + url.hostname + ':' + url.port); }
  }

  getBaseServerUrl() {
    return this.BASE_SERVER;
  }

  getLanguages() {
    return this.languages;
  }

  getLocales() {
    return this.locales;
  }

  getIdentityServerUrl(url) {
    if(url) {
      this.checkDomain(url);
    }
    return this.BASE_SERVER + this.IDENTITY_SERVER;
  }

  getConfigurationServerUrl() {
    return this.BASE_SERVER + this.CONFIGURATION_SERVER;
  }

  getExportWorkerServerUrl() {
    return this.BASE_SERVER + this.EXPORTWORKER_SERVER;
  }

  getapiGatewayServerUrl() {
    return this.BASE_SERVER + this.APIGATEWAY_SERVER;
  }

  getDowntimeServerUrl() {
    return this.BASE_SERVER + this.DOWNTIME_SERVER;
  }

  getQualityServerUrl() {
    return this.BASE_SERVER + this.QUALITY_SERVER;
  }

  getSchedulingServerUrl() {
    return this.BASE_SERVER + this.SCHEDULING_SERVER;
  }
  getParametersServerUrl() {
    return this.BASE_SERVER + this.PARAMETERS_SERVER;
  }

  getIntegrationServerUrl() {
    return this.BASE_SERVER + this.INTEGRATION_SERVER;
  }

  getTimeSeriesDatabaseName() {
    return this.TIME_SERIES_DATABASE_NAME;
  }

  getTimeSeriesDatabaseUrl() {
    return this.BASE_SERVER + this.TIME_SERIES_DATABASE;
  }

  getServerNotificationTopic(val) {
    return ServerNotificationTopics[val];
  }

  getParameterType(val) {
    return ParametersType[ParametersType[val]];
  }

  getFeaturesList() {
    return this.FEATURES_LIST;
  }

  getColor(color) {
    return COLORS[color];
  }

  getNotTranslatedBatchStatus(val) {
    return BatchStatus[val];
  }

  getBatchStatus(val) {
    return this.translatedBatchStatus[`COMMON.${BatchStatus[val]}`];
  }

  getBatchStatusColor(val) {
    return BatchStatusColor[val];
  }

  getOrderStatus(val) {
    return this.translatedOrderStatus[`COMMON.${OrderStatus[val]}`];

  }

  returnValidationColor(val) {
    return (val === true ? ValidationColor['Valid'] : ValidationColor['Error']);
  }

  getOrderStatusColor(val) {
    return OrderStatusColor[val];
  }

  getMachineStatusColor(val) {
    return machineStatusColor[val];
  }

  getEnumKeyByEnumValue(myEnum, enumValue) {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
  }


  getMachineStatusColorFromStatusValue(val) {
    return machineStatusColor[this.getEnumKeyByEnumValue(MachineStatus,val)];
  }

  getNumberOfRowsInsideModal() {
    return this.numberOfRowsInsideModal;
  }

  getCMMSUrl() {
    return this.CMMS_URL;
  }

  getHelpUrl() {
    return this.HELP_URL;
  }

  getHelpPage(page, lng) {
    const ret = this.helpPagesUrls.find(el => el.page === page);
    const link = ((ret && ret.url[lng] !== '' && ret.url[lng] !== null) ? this.HELP_URL + ret.url[lng] : '#')
    return link;
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  getUserSettingsPageLinkDestination() {
    return this.userSettingsPageLinkDestination;
  }

  getUserSettingsAdminPageLinkDestination() {
    return this.userSettingsAdminPageLinkDestination;
  }

  getHelpPageLinkDestination() {
    return this.helpPageLinkDestination;
  }

  getSignalRGroupSubscriptionType(){
    return this.SIGNALR_SUBSCRIPTION_GROUP;
  }

  getSignalRGroupsSubscriptionType(){
    return this.SIGNALR_SUBSCRIPTION_GROUPS;
  }

  getSignalRBroadcastSubscriptionType(){
    return this.SIGNALR_SUBSCRIPTION_BROADCAST;
  }
}

export async function getConfigSettings(localeService: ConfigService, httpClient?: HttpClient) {
  const t = await httpClient?.get('./assets/settings.json').subscribe({
    next: AppSettings => {
      const url = document.location;
      if(url.hostname !== 'localhost') {
        AppSettings["KEYCLOAK_URL"] = url.protocol + '//' + url.hostname;
      }
      localStorage.setItem('appSettings', JSON.stringify(AppSettings));
      this.appConfig = AppSettings;
      return AppSettings;
    },
    error: err => {}
  });
  return t;

}

export function getLanguage(localeService: ConfigService, httpClient?: HttpClient) {
  const lang = localeService.getSelectedLanguage();
  return lang;
}
