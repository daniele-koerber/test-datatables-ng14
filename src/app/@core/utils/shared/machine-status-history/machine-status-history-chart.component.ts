import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { Router,ActivatedRoute } from '@angular/router';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import { SchedulingData } from '../../../data/scheduling';
import { IntegrationData } from '../../../data/integration';

import { Subscription } from 'rxjs';


import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5xy from "@amcharts/amcharts5/xy";


import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { transpileModule } from 'typescript';
import { MachinesStatusHistory } from '../../models/presentation/integration/machine-status-history';
import { BaseClass } from '../../common/base-class/base-class';
import * as moment from 'moment';

@Component({
  selector: 'ngx-machine-status-history-chart',
  styleUrls: ['./machine-status-history-chart.component.scss'],
  templateUrl: './machine-status-history-chart.component.html',
})

export class MachineStatusHistoryChartComponent extends BaseClass implements OnInit, OnChanges {

  @Input() componentData: MachinesStatusHistory;
  @Input() id;
  @Input() chartId: string;
  @Input() height: string = '70px';

  @Input() hoursToDisplay: number;

  @Output() dataLoading: EventEmitter<boolean> = new EventEmitter<boolean>();

  macName = 'machine';

  selectedProcessCell: any;
  chartData: any[] = [];
  macStatus = [];
  statusValue = [];
  legendStatus = [];
  pc;
  numOfMachine = 0;


  root: am5.Root
  series5: am5xy.ColumnSeries
  indicator: any;
  categoryAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>
  legend: am5.Legend

  serverError = false;
  deleteChart = false;

  dataSets;
  lang;
  @Input() date;
  dailyChartData: any[];s
  maxDate: Date;
  minDate: Date;

  @Input() dateStart;
  @Input() dateEnd;

  disableLeftButton: boolean = false;
  disableRightButton: boolean = true;
  singledatechartData: any[] = [];
  hourAxis: any;
  oldMachinePath:string ='';
  rawDate: Date;

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private schedulingService: SchedulingData,
    private translate: TranslateService,
    private integrationService: IntegrationData,
    private router: Router,
    private route: ActivatedRoute,
    private nbAuthService: NbAuthService,

  ) {
    super(nbAuthService);
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.lang = lang;
  }


  dateChanged(date: Date) {
    const pipe = new DatePipe(this.translate.currentLang);
    if (this.date !== pipe.transform(date, 'd MMM y')) {
      this.dataLoading.emit(true);
      setTimeout(() => {
        this.date = pipe.transform(date, 'd MMM y');
        this.rawDate = new Date(date);

        if (!this.chartData.find(el => el.date === this.date)) {
          let endDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
          let startDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

          if(new Date(this.dateStart).getTime() >= new Date(startDate).getTime()){
            startDate = this.dateStart;
          }
          if(new Date(this.dateEnd).getTime() <= new Date(endDate).getTime()){
            endDate = this.dateEnd;
          }

          this.getMachineCurrentState(startDate, endDate);
        } else {
          this.dailyChartData = this.chartData.find(el => el.date === this.date)?.data;

          this.dailyChartData.forEach(data => {
            if (data.fromDate < new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')).getTime()) {
              data.fromDate = (new Date(new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')))).getTime();
              data.fromDateTooltip = pipe.transform(new Date(data.toDateTooltip), 'MM/dd 00:00:00');
            }
          });
          this.series5.data.setAll(this.dailyChartData);
        }
      }, 0);

    }
  }

  dateIncremets(value) {
    this.dataLoading.emit(true);
    setTimeout(() => {
      const pipe = new DatePipe(this.translate.currentLang);

      const newDate: Date = this.rawDate;
      newDate.setDate(this.rawDate.getDate() + value);
      this.date = pipe.transform(newDate, 'd MMM y');
      this.rawDate = newDate;


      if (!this.chartData.find(el => el.date === this.date)) {
        let endDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
        let startDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

        if(new Date(this.dateStart).getTime() >= new Date(startDate).getTime()){
          startDate = this.dateStart;
        }
        if(new Date(this.dateEnd).getTime() <= new Date(endDate).getTime()){
          endDate = this.dateEnd;
        }

        this.getMachineCurrentState(startDate, endDate);
      } else {
        this.dailyChartData = this.chartData.find(el => el.date === this.date)?.data;

        this.dailyChartData.forEach(data => {
          if (data.fromDate < new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')).getTime()) {
            data.fromDate = (new Date(new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')))).getTime();
            data.fromDateTooltip = pipe.transform(new Date(data.toDateTooltip), 'MM/dd 00:00:00');
          }
        });
        this.series5.data.setAll(this.dailyChartData);

        if ((this.dailyChartData?.length == 0 && this.dateStart) || (this.singledatechartData?.length == 0 && !this.dateStart)  || this.serverError) {
          this.indicator.show();
        } else {
          if (this.indicator) {
            this.indicator.hide()
          }
        }
      }
    }, 0);
  }


  ngOnInit() {

  }

  ngAfterViewInit(): void {
    if (this.dateStart) {
      this.drawChart();
      this.updateTargetProcessCellData();
    }
  }

  ngOnChanges(changes) {
    if (changes.componentData) {
      if (this.componentData && !this.dateStart)  {
        // if (this.root) {
        //   this.createDataForChart();
        // } else {
        //   am5.ready(() => {
        //     setTimeout(() => {
        //       this.drawChart();
        //     }, 100);
        //   });
        // }

        if (this.componentData.machineStatuses.machineOrComponentPath === this.oldMachinePath && this.root) {
          this.createDataForChart();
        } else {
          if (this.root) {
            this.root.dispose();
            this.root = null;
          }
          am5.ready(() => {
            setTimeout(() => {
              this.drawChart();
            }, 100);
          });
        }
      }
    }
  }


  getMachineStatusColor(val) {
    return this.config.getMachineStatusColorFromStatusValue(val);
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    this.pc = (this.processCellPath ? this.processCellPath : this.selectedProcessCell);

    if( this.dateStart) {
      this.getChartData(this.dateStart, this.dateEnd)
    } else {
      this.createDataForChart();
    }
  }



  getChartData(dateFrom, dateTo) {
    this.serverError = false;
    const pipe = new DatePipe(this.translate.currentLang);
    let startDate = dateFrom;
    let endDate = dateTo;

    this.maxDate = dateTo !== null ? new Date(dateTo) : this.maxDate;
    this.minDate = dateTo !== null ? new Date(dateFrom) : this.minDate;
    this.minDate = new Date(pipe.transform(this.minDate, 'yyyy-MM-ddT00:00:00'))

    endDate = new Date(this.maxDate.toUTCString()).toISOString();
    startDate =  new Date(this.minDate.toUTCString()).toISOString();

    this.date = pipe.transform(endDate, 'd MMM y');

    endDate = new Date(new Date(pipe.transform(endDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
    startDate = new Date(new Date(pipe.transform(endDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

    this.rawDate = new Date(this.maxDate);

    if(new Date(this.dateStart).getTime() >= new Date(startDate).getTime()){
      startDate = this.dateStart;
    }
    if(new Date(this.dateEnd).getTime() <= new Date(endDate).getTime()){
      endDate = this.dateEnd;
    }

    if (!this.chartData.find(el => el.date === this.date)) {
      this.getMachineCurrentState(startDate, endDate);
    } else {
      this.dailyChartData = this.chartData.find(el => el.date === this.date)?.data;

      this.dailyChartData.forEach(data => {
        if (data.fromDate < new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')).getTime()) {
          data.fromDate = (new Date(new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')))).getTime();
          data.fromDateTooltip = pipe.transform(new Date(data.toDateTooltip), 'MM/dd 00:00:00');
        }
      });
      this.series5.data.setAll(this.dailyChartData);
      this.hourAxis.set('min', -this.hoursToDisplay);
    }



  }

  getMachineCurrentState(startDate, endDate) {
    this.dataLoading.emit(true);
    this.integrationService.getMachineHistoryStateByProcessCellPath(startDate, endDate, this.machinePath, null,true ).then((machineStatus) => {
      this.componentData = machineStatus;
      this.serverError = false;
      this.createDataForChart();
    }).catch(error => {
      this.serverError = true;
      this.dataLoading.emit(false);
      this.chartData = [];
      this.dailyChartData = [];
        if (this.indicator) {
          this.indicator.show()
        }
    });
  }

  createDataForChart() {
    const self = this;
    const pipe = new DatePipe(this.translate.currentLang);

    this.singledatechartData = [];
    this.dailyChartData = [];
    this.statusValue = [];
    this.macStatus = [];
    this.legendStatus = [];

    this.macName = this.componentData.machineStatuses.machineOrComponentName;

    for (var item = 0; item < this.componentData.machineStatuses.statuses.length; item++) {
      let alarmText = null
      if (this.componentData.machineStatuses.statuses[item].alarmText || this.componentData.machineStatuses.statuses[item].alarmId) {
        self.translate.get(["OVERVIEW.Alarm"]).subscribe((translations) => {
          alarmText = '\n' + translations["OVERVIEW.Alarm"] + ": " + this.componentData.machineStatuses.statuses[item].alarmText + ' (' + this.componentData.machineStatuses.statuses[item].alarmId + ')';
        })
      }

      const obj = {
        machineName: this.macName,
        fromDate: (new Date(this.componentData.machineStatuses.statuses[item].start)).getTime(),
        fromDateTooltip: this.componentData.machineStatuses.statuses[item].start,
        toDate: (new Date(this.componentData.machineStatuses.statuses[item].end)).getTime() ,
        toDateTooltip: this.componentData.machineStatuses.statuses[item].end,
        color: am5.color(this.getMachineStatusColor(this.componentData.machineStatuses.statuses[item].statusValue)),
        status: this.componentData.machineStatuses.statuses[item].status,
        duration: this.secondsToHm(Math.round(this.componentData.machineStatuses.statuses[item].duration*60)),
        alarmText: alarmText,
      };
      if ( this.componentData.machineStatuses.statuses[item].start == null ||
        this.componentData.machineStatuses.statuses[item].end == null ||
        this.componentData.machineStatuses.statuses[item].status == null ||
        this.componentData.machineStatuses.statuses[item].duration == null) {
          console.log("MACHINE_STATUS_HISTORY chart with null value",
          this.componentData.machineStatuses.statuses[item].start,this.componentData.machineStatuses.statuses[item].end)
        }
        const dateStart = new Date(this.componentData.machineStatuses.statuses[item].start)
        const dateEnd = new Date(this.componentData.machineStatuses.statuses[item].end)
      if (dateEnd > dateStart) {
        this.singledatechartData.push(obj)
      }
      if (!this.statusValue.includes(this.componentData.machineStatuses.statuses[item].statusValue)) {
        const obj = {
          statusName: this.componentData.machineStatuses.statuses[item].status,
          statusValue: this.componentData.machineStatuses.statuses[item].statusValue
        }
        const legendObj = {
          name: this.componentData.machineStatuses.statuses[item].status,
          color: am5.color(this.getMachineStatusColor(this.componentData.machineStatuses.statuses[item].statusValue))
        }
        this.statusValue.push(this.componentData.machineStatuses.statuses[item].statusValue)
        this.macStatus.push(obj)
        this.legendStatus.push(legendObj)
      }
    }

    if (this.dateStart) {
      if (this.maxDate === null && this.minDate === null) {
        this.maxDate = new Date(Math.max( ...this.singledatechartData.map(element => new Date(pipe.transform(new Date(element.toDate), 'd MMM y')).getTime() )));
        this.minDate = new Date(Math.min( ...this.singledatechartData.map(element => new Date(pipe.transform(new Date(element.toDate), 'd MMM y')).getTime() )));
        this.date = pipe.transform(this.maxDate, 'd MMM y');
        this.rawDate = new Date(this.maxDate);

      }

      this.disableLeftButton = pipe.transform(this.minDate, 'd MMM y') === this.date;
      this.disableRightButton = pipe.transform(this.maxDate, 'd MMM y') === this.date;

      if (!this.chartData.find(el => el.date === this.date)){
        this.chartData.push({ date: this.date,
                            data: this.singledatechartData,
                          });
      }

      this.dailyChartData = this.chartData.find(el => el.date === this.date)?.data;

      this.dailyChartData.forEach(data => {
        if (data.fromDate < new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')).getTime()) {
          data.fromDate = (new Date(new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')))).getTime();
          data.fromDateTooltip = data.toDateTooltip;
        }
      });

      this.series5.data.setAll(this.dailyChartData);
    } else {
      this.series5.data.setAll(this.singledatechartData);
    }

    const macNames = [];
    const obj = {
      machineName: this.macName
    }
    macNames.push(obj)
    this.categoryAxis.data.setAll(macNames)

    this.legend?.data?.setAll(this.legendStatus);

    if ((this.dailyChartData?.length == 0 && this.dateStart) || (this.singledatechartData?.length == 0 && !this.dateStart)  || this.serverError) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide()
      }
    }

    function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
      if (a_start < b_start && b_start < a_end) return true; // b starts in a
      if (a_start < b_end   && b_end   < a_end) return true; // b ends in a
      if (b_start <  a_start && a_end   <  b_end) return true; // a in b
      return false;
    }

    function multipleDateRangeOverlaps(timeEntries) {
        let i = 0, j = 0;
        let timeIntervals = timeEntries.filter(entry => entry.start != null && entry.end != null);

        if (timeIntervals != null && timeIntervals.length > 1)
        for (i = 0; i < timeIntervals.length - 1; i += 1) {
            for (j = i + 1; j < timeIntervals.length; j += 1) {
              let a_start = new Date(timeIntervals[i].start);
              let a_end = new Date(timeIntervals[i].end);
              let b_start = new Date(timeIntervals[j].start);
              let b_end = new Date(timeIntervals[j].end);
                    if (dateRangeOverlaps(a_start,a_end,b_start,b_end)) {
                      console.log("KODIS LOG: Date&Time overlaps in line status history chart",timeIntervals[i].start,timeIntervals[i].end)
                      return true;
                    }
                }
            }
      return false;
    }


  }


    drawChart() {
      const self = this;
      if (!this.dateStart) {
        this.oldMachinePath = this.componentData?.machineStatuses?.machineOrComponentPath
      }

      this.root = am5.Root.new(this.chartId);
      this.root.dateFormatter.set("intlLocales", this.lang);
      this.root.numberFormatter.set("intlLocales", this.lang);

      this.root.dateFormatter.setAll({dateFormat: { year:'numeric', month: '2-digit', "day": '2-digit',"hour": "numeric", "minute": "numeric" }, dateFields: ['fromDateTooltip','toDateTooltip'],});

      let chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: this.root.verticalLayout,
        marginBottom: this.dateStart ? 10 : 0,
        marginTop: this.dateStart ? 10 : 0,
        paddingBottom: this.dateStart ? 10 : 0,
        paddingTop: this.dateStart ? 10 : 0
      }));

      //Category axix
      this.categoryAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(this.root, {
          categoryField: "machineName",
          renderer: am5xy.AxisRendererY.new(this.root, {
            minGridDistance: 10,
          }),
          tooltip: am5.Tooltip.new(this.root, {
          })
        })
      );
      if (!this.dateStart) {
        this.categoryAxis.get("renderer").labels.template.set("forceHidden", true);
      }


      if (!this.dateStart) {
        //X axix (now, -1h, -2h...)
        const pcData = this.configurationService.getSelectedProcessCell();
        const numOfH = Number(pcData.areaSettings.numberOfHoursDisplayedOnOverview);
          this.hourAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(this.root, {
              maxDeviation: 1,
              min: -this.hoursToDisplay,
              max: 0,
              renderer: am5xy.AxisRendererX.new(this.root, {minGridDistance: 40,}),
              visible: false
            })
          );
          this.hourAxis.get('renderer').labels.template.adapters.add('text', (text, target): string => {
            return +text === 0 ? 'now' : text + 'h';
          });
          this.hourAxis.get('renderer').labels.template.setAll({
            fontSize: "10px",
            opacity: 0.5
          })

      }

      let dateAxis = chart.xAxes.push(
        am5xy.DateAxis.new(this.root, {
          baseInterval: { timeUnit: "minute", count: 1 },
          renderer: am5xy.AxisRendererX.new(this.root, {
            minGridDistance: this.dateStart? 45 : 60,
            // opposite: true,
          }),
          tooltip: am5.Tooltip.new(this.root, {}),
          startLocation: 0.5,
          endLocation: 0.5,
          dateFormats: {
            hour: {"hour": "numeric", "minute": "numeric" },
            minute: { "hour": "numeric", "minute": "numeric" },
            second: { "hour": "numeric", "minute": "numeric" },
          },
          periodChangeDateFormats: {
            hour: { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" },
            minute: { "hour": "numeric", "minute": "numeric" },
            second: { "hour": "numeric", "minute": "numeric" },
          },
          })
      );
      dateAxis.get('renderer').labels.template.setAll({
        fontSize: "10px",
        opacity: 0.5
      })


      let dateRenderer = dateAxis.get("renderer");
      if (!this.dateStart) {
        dateRenderer.grid.template.setAll({
          //disabled: true,
          strokeOpacity: 0
        });
        // dateRenderer.labels.template.setAll({
        //   forceHidden: true
        // });

      } else {
        dateRenderer.labels.template.setAll({
          location: 0.5
        });
        // Add scrollbars
        chart.set("scrollbarX", am5.Scrollbar.new(this.root, {
          orientation: "horizontal",
          y: am5.p0
        }));
        //Legend
        this.legend = chart.children.push(am5.Legend.new(this.root, {
          nameField: "name",
          fillField: "color",
          strokeField: "color",
          centerX: am5.p50,
          x: am5.p50
        }))

        //Data Export
        if (this.canExportData) {
          let exporting = am5exporting.Exporting.new(this.root, {
            menu: am5exporting.ExportingMenu.new(this.root, {
              align: "left",
            }),
            dataSource: this.dailyChartData
          });
        }
      }


      this.series5 = chart.series.push(am5xy.ColumnSeries.new(this.root, {
        xAxis: dateAxis,
        yAxis: this.categoryAxis,
        openValueXField: "fromDate",
        valueXField: "toDate",
        categoryYField: "machineName",
        sequencedInterpolation: true,
      }));


      let fromText = '';
      let toText = '';
      self.translate.get(["SHARED.From","SHARED.To" ]).subscribe((translations) => {
        fromText = translations["SHARED.From"];
        toText = translations["SHARED.To"];
      })

      this.series5.columns.template.setAll({
        strokeOpacity: 0,
        tooltipText:  this.dateStart ? "[bold]{status} [/]({duration}): \n" +
                      fromText + ": {fromDateTooltip}  \n" + toText + ": {toDateTooltip} {alarmText}" :
                      "[fontSize:11px;bold]{status} [/][fontSize:11px;]({duration}): \n" +
                      fromText + ": {fromDateTooltip}  \n" + toText + ": {toDateTooltip} {alarmText}",
      });

      // Make each column to be of a different color
      this.series5.columns.template.adapters.add("fill", function (fill, target) {
        return target.dataItem.dataContext["color"]
      });

      this.series5.columns.template.adapters.add("stroke", function (stroke, target) {
        return target.dataItem.dataContext["color"];
      });

      this.series5.data.processor = am5.DataProcessor.new(this.root, {
        dateFields: ["fromDate", "toDate"],
        // dateFormat: "yyyy-MM-dd HH:mm"
      });
      // this.series5.data.setAll(this.dailyChartData);
      this.series5.events.on("datavalidated", function(ev) {
        self.dataLoading.emit(false);
      });


      // //Add cursor
      // chart.set("cursor", am5xy.XYCursor.new(this.root, {
      //   xAxis: dateAxis,
      // }));





      this.showIndicator();

      if (this.dailyChartData?.length == 0 || this.serverError) {
        this.indicator.show();
      } else {
        if (this.indicator) {
          this.indicator.hide()
        }
      }

      if (!this.dateStart) {
        this.createDataForChart();
      }
    }

    showIndicator() {
      this.indicator = this.root.container.children.push(am5.Container.new(this.root, {
        width: am5.p100,
        height: am5.p100,
        layer: 1000,
        background: am5.Rectangle.new(this.root, {
          fill: am5.color(0xffffff),
          fillOpacity: 1.0
        })
      }));
      let indicatorLabel = this.indicator.children.push(am5.Label.new(this.root, {
        fontSize: 20,
        x: am5.p50,
        y: am5.p50,
        centerX: am5.p50,
        centerY: am5.p50
      }));
      if (this.serverError === true) {
        this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
          const text = translations["SHARED.Server_Error_While_Data_Loading"];
          indicatorLabel.set("text", text)
        });
      } else if (this.isLoading == true) {
        const text = "";
        indicatorLabel.set("text", text)
      } else  {
        this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
          const text = translations["SHARED.No_Data_Available"];
          indicatorLabel.set("text", text)
        });
      }
    }

  secondsToHm(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + "h " : "";
    var mDisplay = m > 0 ? m + "min" : "";
    var sDisplay = s > 0 ? s + "s" : "";
    return hDisplay + mDisplay + sDisplay;
}


  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }


}
