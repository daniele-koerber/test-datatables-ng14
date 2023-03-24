import { subscribeOn } from 'rxjs-compat/operator/subscribeOn';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { NbColorHelper, NbDialogService, NbSidebarService } from '@nebular/theme';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import { EventInput, Calendar } from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { ChangeDetectorRef } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrdersModalComponent } from './orders-modal/orders-modal.component';
import { BatchModalComponent } from '../../@core/utils/shared/batch-modal/batch-modal.component';
import { ShiftDefinitionModalComponent } from './shift-definition-modal/shift-definition-modal.component';
import { ImportExportShiftsModalComponent} from './import-export-shifts-modal/import-export-shifts-modal.component';
import { EditShiftDataModalComponent } from './edit-shift-data-modal/edit-shift-data-modal.component';
import { ShiftDetailsModalComponent } from './shift-details-modal/shift-details-modal.component';
import { SchedulingData } from '../../@core/data/scheduling';
import { ConfigurationData } from '../../@core/data/configuration';
import { DatePipe } from '@angular/common';
import { PlanOrderModalComponent } from './plan-order-modal/plan-order-modal.component';
import { ConfigService } from '../../@core/utils/services';
import {TranslateService} from '@ngx-translate/core';

import allLocales from '@fullcalendar/core/locales-all';
import { AutofillMonitor } from '@angular/cdk/text-field';
import { Subscription } from 'rxjs';
import { DownloadPdfConfirmComponent } from '../../@core/utils/shared/download-pdf-confirm/download-pdf-confirm.component';


@Component({
  selector: 'ngx-calendar',
  styleUrls: ['./calendar.component.scss'],
  templateUrl: './calendar.component.html',
})

export class CalendarComponent implements AfterViewInit {

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  calendarOptions: CalendarOptions;
  calendarApi: Calendar;
  calendar;
  initialized = false;
  isLoading = false;
  serverError = false;
  selectedProcessCell: any;
  selectedProcessCellPath: string;
  calendarshiftsColors: any = [];
  serverNotificationstopic: string = 'ApiGateway';

  signalRListenersNamesGroup: string[] = ['BatchCalendarChanged', 'ShiftPlanChanged'];
  signalRListenersNamesBroadcast: string[] = ['BatchDataChanged'];

  events: any[] = [];
  today: any = null;
  from: any = null;
  to: any = null;
  lang;
  No_production = '';
  canEditShifts = false;
  canOverrideShifts = false;
  canPlanOrder = false;
  canViewReportPage = false;
  canExportData = false;
  donwloadInProgress = false;
  goFullScreenAndPrint = false
  pcSub: Subscription;
  loadSub: Subscription;

  helpLinkPage = 'calendar';
  hideErpOrders = true;

  constructor(
    private sidebarService: NbSidebarService,
    private dialogService: NbDialogService,
    private config: ConfigService,
    private scheduleService: SchedulingData,
    private configurationService: ConfigurationData,
    public translate: TranslateService,
    private authService: NbAuthService,
    private cdRef:ChangeDetectorRef,
  ) {
    this.config.translateBatchStatus();
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
    this.translate.get("COMMON.No_production").subscribe((No_production) => {
      this.No_production = No_production;
    });

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanEditShifts")) {
        this.canEditShifts = true;
      }
      if (payload.features.includes("CanOverrideShifts")) {
        this.canOverrideShifts = true;
      }
      if (payload.features.includes("CanPlanOrder")) {
        this.canPlanOrder = true;
      }
      if (payload.features.includes("CanViewReportPage")) {
        this.canViewReportPage = true;
      }
      if (payload.features.includes("CanExportData")) {
        this.canExportData = true;
      }
    });

    // setTimeout(() => {
    //   this.calendarApi = this.calendarComponent.getApi();
    // });

    this.calendarshiftsColors = [
     // { key: 0, color: NbColorHelper.hexToRgbA(this.config.getColor('accent_4'), 0.05)},
      { key: 0, color: NbColorHelper.hexToRgbA(this.config.getColor('accent_3'), 0.08)},
      { key: 1, color: NbColorHelper.hexToRgbA(this.config.getColor('white'), 0.05)},
   //   { key: 2, color: NbColorHelper.hexToRgbA(this.config.getColor('success'), 0.05)},
      { key: 2, color: NbColorHelper.hexToRgbA(this.config.getColor('success'), 0.08)},
      { key: 3, color: NbColorHelper.hexToRgbA(this.config.getColor('black'), 0.2)}, //NO Production color
    ];
    const self = this;

    this.sidebarService.onToggle().subscribe(event=> {
      window.dispatchEvent(new Event('resize'));
    })

    window.addEventListener('resize', (e) => {
      // this.onResize.next();
    });
  }

  BatchCalendarChanged(message) {
    this.updateCalendar(this.from, this.to);
  }

  BatchDataChanged(message) {
    this.updateCalendar(this.from, this.to);
  }

  addNew() {
    this.openPlanOrderModal();
  }

  ShiftPlanChanged(message) {
    this.updateCalendar(this.from, this.to);
  }

  ngOnInit(): void {
    const self = this;
    document.addEventListener("fullscreenchange", function () {
      self.onFullscreen();
    });
    document.addEventListener("webkitfullscreenchange", function () {
      self.onFullscreen();
    });
    document.addEventListener("mozfullscreenchange", function () {
      self.onFullscreen();
    });
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    });

    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
  }

  setHelpPage() { 
    this.config.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }
  
  updateTargetProcessCellData() {
    const self = this;
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.selectedProcessCellPath = this.selectedProcessCell.path;

    self.calendarOptions = {

      height: "auto",
      locales: allLocales,
      locale: self.lang,
      plugins: [
        timeGridPlugin,
        interactionPlugin, // needed for dateClick
        dayGridPlugin,
      ],
      nextDayThreshold: '00:00:00',
      allDaySlot: false,
      headerToolbar: {
        left: 'today',
        center: 'prev title next',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },

      editable: false,
      eventDurationEditable: false,
      initialView: 'timeGridWeek',
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
      eventClick: (info) => {
        const target = info.jsEvent.target as HTMLElement;
        if (target.classList.contains('fc-event-title') && target.parentElement.classList.contains('fc-bg-event')) {
          this.openEditShiftDataModal(
            +info.event._def.publicId,
            info.event._def.title,
            info.event._def.extendedProps.startDate,
            info.event._def.extendedProps.endDate,
            info.event._def.extendedProps.refDate,
            info.event._def.extendedProps.slotId,
          );
        } else {
          if (target.classList.contains('fc-bg-event')) {
            if (info.event._def.title !== self.No_production) { this.openPlanOrderModal();}
          }
        }
        if (!target.classList.contains('fc-bg-event') && !target.parentElement.classList.contains('fc-bg-event')) {

          this.openBatchModal(info.event._def.extendedProps);
        }
      },
      dateClick: (info) => {
        // day click on month view

        // const calendarApi = this.calendarComponent.getApi();
        // calendarApi.changeView('timeGridDay');
        // calendarApi.gotoDate(info.dateStr);
        // this.updateCalendar(this.from, this.to);
        // window.dispatchEvent(new Event('resize'));
      },
      datesSet: ( dateInfo ) => {
        const pipe = new DatePipe('en-US');

        this.today = pipe.transform( new Date(), 'yyyy-MM-dd');
        this.from = pipe.transform( dateInfo.start, 'yyyy-MM-ddTHH:mm:ss');
        this.to = pipe.transform( dateInfo.end, 'yyyy-MM-ddTHH:mm:ss');

        // if (this.today !== pipe.transform( this.from, 'yyyy-MM-dd')) {
          this.isLoading = true;
          this.updateCalendar(this.from, this.to);
        // }
      },
      events: [],
      eventDidMount: (arg: any) => {
          if (arg.event._def.ui.display === 'background') {
            if (arg.el.parentNode.clientHeight > 100) {
            } else {
              const label = arg.el.querySelectorAll('.fc-event-title');
              //label[0].style.display = 'none';

            }
          }
      },
      eventContent: (arg: any) => {
        const pipe = new DatePipe(this.lang);
        if (arg.event._def.ui.display === 'background') {

          setTimeout(() => {
            const teamLabels = $('.fc-event-title').not('.fc-sticky')
            for (let team of teamLabels) {
              if (team.clientHeight >= team.parentElement.clientHeight){
                team.innerText = ( team.innerText.length > 0 ? team.innerText.charAt(0) : '') + '. ' + team.innerText.split(' ')[1]?.charAt(0) + '. ';
                $(team)?.addClass('small-title');
              }
              if (team.clientHeight !== 0 && team.parentElement.clientWidth !== 0 && team.parentElement.clientHeight <= 30) {
                team.innerText = '...';
                $(team)?.addClass('small-title');
              }
            }
          });

        } else {
          
          if ((arg.view.type === 'timeGridWeek') || (arg.view.type === 'timeGridDay')) { // week view
            const startHour = pipe.transform(new Date(arg.event._def.extendedProps.startDate), 'short');
            const endHour = pipe.transform(new Date(arg.event._def.extendedProps.endDate), 'short');
            const timeText = `${startHour}<br />${endHour}`;
            const shortStartHour = pipe.transform(new Date(arg.event._def.extendedProps.startDate), 'shortTime');
            const shortEndHour = pipe.transform(new Date(arg.event._def.extendedProps.endDate), 'shortTime');
            const shortTimeText = `${shortStartHour} - ${shortEndHour}`;

            const startDate = new Date(arg.event._def.extendedProps.startDate);
            const endDate = new Date(arg.event._def.extendedProps.endDate);
            var batchDurationDay = +(((Math.round((arg.event._def.extendedProps.estimatedDurationTicks / 10_000_000) * 10) / 10) / 60).toString()).split('.')[0];


            // In case batch is splitted in 2 days, consider batch duration only of first day
            if (arg.isStart && endDate.getDay() !== startDate.getDay()){
              const dayStartDate = new Date(arg.event._def.extendedProps.startDate);
              const dayEndDate = new Date(arg.event._def.extendedProps.startDate);

              dayEndDate.setHours(23);
              dayEndDate.setMinutes(59);
              dayEndDate.setSeconds(59);
              const difference = dayEndDate.getTime() - dayStartDate.getTime()
              batchDurationDay = Math.round(difference / 60000);
            }

            if (arg.isEnd && endDate.getDay() !== startDate.getDay()){
              const dayStartDate = new Date(arg.event._def.extendedProps.endDate);
              const dayEndDate = new Date(arg.event._def.extendedProps.endDate);

              dayStartDate.setHours(0);
              dayStartDate.setMinutes(0);
              dayStartDate.setSeconds(0);
              const difference = dayEndDate.getTime() - dayStartDate.getTime()
              batchDurationDay = Math.round(difference / 60000);
            }

            if (batchDurationDay <= 30) {
              return { html: `
              <div class="halfhour"></div>`,
              };
            } else if ((batchDurationDay > 30) && (batchDurationDay <= 60)) {

              return { html: `
              <div class="onehour" style='display:flex;'>
              <span class='dot' style="background : ${self.config.getBatchStatusColor(self.config.getNotTranslatedBatchStatus(arg.event._def.extendedProps.status))}"></span>
              <p>${arg.event._def.title}</p>
              </div>
                `,
              };
            } else if ((batchDurationDay > 60) && (batchDurationDay <= 110)) {

              return { html: `
              <div class="fc-event-time twohours"">${shortTimeText}</div>
              <div style='display:flex;'>
              <span class='dot' style="background : ${self.config.getBatchStatusColor(self.config.getNotTranslatedBatchStatus(arg.event._def.extendedProps.status))}"></span>
              <p>${arg.event._def.title}</p>
              </div>
                `,
              };
            } else if ((batchDurationDay > 110) && (batchDurationDay <= 150)) {

              return { html: `
              <div class="fc-event-time threehours">${shortTimeText}</div>

              <div style='display:flex;'>
              <span class='dot' style="background : ${self.config.getBatchStatusColor(self.config.getNotTranslatedBatchStatus(arg.event._def.extendedProps.status))}"></span>
              <p style='font-weight: bold'>${self.config.getBatchStatus(arg.event._def.extendedProps.status)}</p>
              </div>

              <div class="fc-event-title fc-sticky">${arg.event._def.title}</div>
                `,
              };
            } else {

              return { html: `
                <div class="fc-event-time morethanthreehours">${timeText}</div>

                <div style='display:flex;'>
                <span class='dot' style="background : ${self.config.getBatchStatusColor(self.config.getNotTranslatedBatchStatus(arg.event._def.extendedProps.status))}"></span>
                <p style='font-weight: bold'>${self.config.getBatchStatus(arg.event._def.extendedProps.status)}</p>
                </div>

                <div class="fc-event-title-container">${arg.event._def.title}</div>
                <div class="fc-event-title fc-sticky">${arg.event._def.extendedProps.productCode}` + (arg.event._def.extendedProps.parametersModified === true ? ' <i style="font-size: .8rem;" class="fas fa-hashtag"></i>' : '') + `
                </div>`,
              };
            }
          } else { //Month view
            const startHour = pipe.transform(new Date(arg.event._def.extendedProps.startDate), 'HH:mm aaaaa\'m\'');
            const endHour = pipe.transform(new Date(arg.event._def.extendedProps.endDate), 'HH:mm aaaaa\'m\'');
            const timeText = ""; // `${startHour} - ${endHour}`;
            return { html: `
              <div style="border-color : ${self.config.getBatchStatusColor(self.config.getNotTranslatedBatchStatus(arg.event._def.extendedProps.status))}" class="fc-daygrid-event-dot"></div>
              <div style="color:${self.config.getColor('black')}" class="fc-event-title-container">${arg.event._def.title}</div>
              `,
            };
          }
        }
      }
    };
    this.initialized = true;
    if(this.from && this.to) {
      this.isLoading = true;
      this.updateCalendar(this.from, this.to);
    }
  }

  openOrdersDialog() {
    this.dialogService.open(OrdersModalComponent, {
    });
  }

  // openImportExportShiftDialog(from, to) {
  //   const obj = {
  //     from,
  //     to
  //   };
  //   this.dialogService.open(ImportExportShiftsModalComponent, {
  //     context: obj as Partial<ImportExportShiftsModalComponent>,
  //   }).onClose.subscribe({
  //     next: (closed: any) => {
  //       if (closed) {
  //         // this.updateCalendar(this.from, this.to);
  //       }
  //     },
  //     error: (err: any) => {},
  //   });
  // }

  openShiftDefinitionDialog() {
    const obj = {
      from: this.from,
      to: this.to,
    };
    this.dialogService.open(ShiftDefinitionModalComponent, {
      context: obj as Partial<ShiftDefinitionModalComponent>,
    })
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.updateCalendar(this.from, this.to);
        }
      },
      error: (err: any) => {},
    });
  }

  openBatchModal(batch) {
    const obj = {
      batch: batch,
    };
    this.dialogService.open(BatchModalComponent, {
      context: obj as Partial<BatchModalComponent>,
    }).onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.updateCalendar(this.from, this.to);
        }
      },
      error: (err: any) => {},
    });
  }

  openPlanOrderModal() {
    if(this.canPlanOrder === true) {
      const obj = {};
      this.dialogService.open(PlanOrderModalComponent, {
        context: obj as Partial<PlanOrderModalComponent>,
      }).onClose.subscribe({
        next: (closed: any) => {
          if (closed) {
            this.updateCalendar(this.from, this.to);
          }
        },
        error: (err: any) => {},
      });
    }
  }

  openEditShiftDataModal(id: number, teamName: string, shiftStartDatetime: any, shiftEndDatetime: any, refDate: any, slotId:number) {

    let now = new Date().getTime()
    let shiftStartTime = (new Date(shiftStartDatetime).getTime())
    let shiftEndTime = (new Date(shiftEndDatetime).getTime())
    const obj = {
      team : {
        id : id,
        teamName : teamName,
      },
      shiftStartDatetime: shiftStartDatetime,
      shiftEndDatetime  : shiftEndDatetime,
      refDate: refDate,
      slotId : slotId,
    };

    if (this.canOverrideShifts === true && shiftStartTime > now)    {
      this.dialogService.open(EditShiftDataModalComponent, {
        context: obj as Partial<EditShiftDataModalComponent>,
      }).onClose.subscribe({
        next: (closed: any) => {
          if (closed) {
            this.updateCalendar(this.from, this.to);
          }
        },
        error: (err: any) => {},
      });
    } else if (this.canViewReportPage && shiftStartTime < now ) {
      this.dialogService.open(ShiftDetailsModalComponent, {
        context: obj as Partial<ShiftDetailsModalComponent>,
      }).onClose.subscribe({
        next: (closed: any) => {
        },
        error: (err: any) => {},
      });

    }
  }

  updateCalendar(from, to) {
    this.events = [];
    this.serverError = false;
    this.scheduleService.getBatchesTimeFiltered(this.selectedProcessCellPath, from, to).then(batches => {

      this.scheduleService.getShiftsTimeFiltered(this.selectedProcessCellPath, from, to).then(shifts => {
        batches.forEach(batch => {
          this.events.push({
            title              : batch.productionOrder,
            processCellPath    : this.selectedProcessCellPath,
            startDate          : batch.batchExpectedStart,
            endDate            : batch.batchExpectedEnd,
            timeSeriesStart    : batch.timeSeriesStart,
            timeSeriesEnd      : batch.timeSeriesEnd,
            start              : batch.batchExpectedStart,
            end                : batch.batchExpectedEnd,
            batchExpectedStart : batch.batchExpectedStart,
            batchExpectedEnd   : batch.batchExpectedEnd,
            productionOrder    : batch.productionOrder,
            productCode        : batch.productCode,
            productDescription : batch.productDescription,
            status             : batch.status,
            uom                : batch.uom,
            currentDurationTicks: batch.currentDurationTicks ,
            estimatedDurationTicks : batch.estimatedDurationTicks,
            statusDescriptions : batch.statusValue,
            version            : batch.version,
            batchDuration      : batch.estimatedDurationTicks,
            targetQuantity     : batch.targetQuantity,
            parametersModified : batch.parametersModified,
          });
        });

        let i = 0;

          shifts.forEach(shift => {
            this.events.push({
              id       : shift.isTeamOverriden ? shift.overrideTeamId : shift.teamId,
              title    : shift.isTeamOverriden ? (shift.overrideTeamName !== null ? shift.overrideTeamName : this.No_production) :  (shift.teamName !== null ? shift.teamName : this.No_production),
              startDate: shift.shiftStartDatetime,
              endDate  : shift.shiftEndDatetime,
              slotId   : shift.slotId,
              start    : shift.shiftStartDatetime,
              end      : shift.shiftEndDatetime,
              refDate  : shift.shiftDate,
              display  : 'background',
              className: shift.isTeamOverriden ? 'overwrite' : '' ,
              color    : shift.isTeamOverriden ? (shift.overrideTeamColor !== null ? NbColorHelper.hexToRgbA(shift.overrideTeamColor, 0.2) : this.calendarshiftsColors[3].color) : shift.teamName !== null ? NbColorHelper.hexToRgbA(shift.teamColor, 0.2) : this.calendarshiftsColors[3].color ,
            });
            i = i < 2 ? i + 1 : 0;
          });
          this.calendarOptions.events = [];
          this.calendarOptions.events = this.events;
          setTimeout(() => {
            const teamLabels = $('.fc-event-title')
            // for (let team of teamLabels) {
            //   if (team.clientWidth > team.parentElement.clientHeight){
            //     team.innerText = ( team.innerText.length > 0 ? team.innerText.charAt(0) : '') + '. ' + team.innerText.split(' ')[1]?.charAt(0) + '. ';
            //     $(team)?.addClass('small-title');
            //   }
            //   if (team.clientWidth !== 0 && team.parentElement.clientHeight !== 0 && team.parentElement.clientHeight <= 50) {
            //     team.innerText = '...';
            //     $(team)?.css('visibility', 'hidden');
            //   }
            // }
          });

        this.isLoading = false;
      }).catch(() =>{
        this.isLoading = false;
        this.serverError = true;
      });
    }).catch(() =>{
      this.isLoading = false;
      this.serverError = true;
    });
}

  getStatusColor(val) {
    return this.config.getBatchStatusColor(val);
  }

  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    document.removeEventListener("fullscreenchange", function () {});
    document.removeEventListener("webkitfullscreenchange", function () {});
    document.removeEventListener("mozfullscreenchange", function () {});  
  }


  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.hideErpOrders = !this.configurationService.getCustomSettings().ERP_orders_enabled;
        this.setHelpPage();
        this.updateTargetProcessCellData();
      }
    });
  }

  UpdateCalendarAfterNotification(message) {
    this.updateCalendar(this.from, this.to);
  }

  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  getComponentSignalRSubscriptionTypeGroup(){
    return "group";
  }
  getComponentSignalRSubscriptionTypeBroadcast(){
    return "broadcast";
  }
  getComponentSignalRListenersNamesGroup(){
    return this.signalRListenersNamesGroup;
  }
  getComponentSignalRListenersNamesBroadcast(){
    return this.signalRListenersNamesBroadcast;
  }

  secondsToHm(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + "h " : "";
    var mDisplay = m > 0 ? m + "min" : "";
    var sDisplay = s > 0 ? s + "s" : "";
    return hDisplay + mDisplay ;
  }

  //Mange calendar PDF download
  /* View in fullscreen */
  public openFullscreen(elem): void {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }

  }


  onFullscreen() {
    const self = this;
    if(self.goFullScreenAndPrint) {
      self.openPDF();
      self.goFullScreenAndPrint = false;
    }
  }

  public print(): void {
    const self = this;
    if (window.innerHeight == screen.height) {
      this.openPDF();
    }
    else {
      this.dialogService.open(DownloadPdfConfirmComponent)
        .onClose.subscribe({
          next: (goFullScreen: any) => {
            if (goFullScreen) {
              self.goFullScreenAndPrint = true;
              const elem = document.documentElement;
              this.openFullscreen(elem);
            }
            return;
          },
        });
    }
  }

  public openPDF(): void {
    this.donwloadInProgress = true;
    var fileName = this.selectedProcessCell?.name + '_calendar-export.pdf'

    window.setTimeout(() => {
      let DATA: HTMLElement = document.getElementById('exportArea');
      DATA.style.height = "";
      html2canvas(DATA).then((canvas) => {

        let pageHeight = 295;  
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;

        const FILEURI = canvas.toDataURL('image/png');

        const pdf = new jsPDF("p", "mm",);
        var position = 0;
        var heightLeft = fileHeight;
        pdf.addImage(FILEURI, "JPEG", 0, position, fileWidth, fileHeight);

        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - fileHeight;
          pdf.addPage();
          pdf.addImage(FILEURI, 'JPEG', 0, position, fileWidth, fileHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(fileName);


        this.donwloadInProgress = false;
        
      });
    }, 100)

  }
}
