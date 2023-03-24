import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogRef } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { FormControl } from '@angular/forms';

import { Router,ActivatedRoute } from '@angular/router';

import { ConfigService } from '../../../services/config.service';
import { ConfigurationData } from '../../../../data/configuration';
import { SchedulingData } from '../../../../data/scheduling';
import { IntegrationData } from '../../../../data/integration';

import { Subscription } from 'rxjs';


import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5xy from "@amcharts/amcharts5/xy";


import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { transpileModule } from 'typescript';
import { BaseClass } from '../../../common/base-class/base-class';
import * as moment from 'moment';

@Component({
  selector: 'ngx-machines-status-history-chart',
  styleUrls: ['./machines-status-history-chart.component.scss'],
  templateUrl: './machines-status-history-chart.component.html',
})

export class MachinesStatusHistoryChartComponent extends BaseClass implements OnInit, OnChanges {
  @Input() tabIndex: number;
  @Input() selectedTabTitle: number;
  @Input() tabTitle: number;

  @Input() dateStart;
  @Input() dateEnd;
  @Input() id;
  @Input() processCell: any;
  @Input() isReport = false;
  @Input() date;

  selectedProcessCell: any;
  chartConfig = {
    data: {},
    options: {},
    type: '',
  };
  chartData: any[] = [];
  machines = [];
  chartRawData;
  shifts = [];
  macStatus = [];
  statusValue = [];
  legendStatus = [];
  pc;
  numOfMachine = 0;

  chartId = 'machinesStatusHistorychartId'

  root: am5.Root
  series5: am5xy.ColumnSeries
  indicator: any;

  periodicRepeat;
  isFirstLoading = true;
  isTeamReport = false;
  serverError = false;
  dataLoaded = false;
  showMachineInUse = false

  pcSub: Subscription;
  loadSub: Subscription;
  dataSets;
  lang;
  dailyChartData: any[];s
  maxDate: Date;
  minDate: Date;
  disableLeftButton: boolean = false;
  disableRightButton: boolean = true;
  singledatechartData: any[] = [];
  domain: boolean;
  rawDate: Date;

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private schedulingService: SchedulingData,
    private translate: TranslateService,
    private integrationService: IntegrationData,
    protected ref: NbDialogRef<MachinesStatusHistoryChartComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private nbAuthService: NbAuthService,

  ) {
    super(nbAuthService);
    this.isFirstLoading = true;
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.lang = lang;
  }


  dateChanged(value) {
    const pipe = new DatePipe(this.translate.currentLang);
    if (this.date !== value) {
      this.isLoading = true;
      this.loadingFinished.emit(false);
      setTimeout(() => {
        this.date = pipe.transform(value, 'd MMM y');
        this.rawDate = new Date(value);

        if (!this.chartData.find(el => el.date === this.date)) {
          let endDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
          let startDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

          if(new Date(this.dateStart).getTime() >= new Date(startDate).getTime()){
            startDate = this.dateStart;
          }
          if(new Date(this.dateEnd).getTime() <= new Date(endDate).getTime()){
            endDate = this.dateEnd;
          }

          this.getMachinesCurrentState(startDate, endDate, true);
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



  ngOnInit() {
    this.isLoading = true;
    this.loadingFinished.emit(false);
    this.dataLoaded = false;
    this.shifts = [];

    const extras = JSON.parse(localStorage.getItem('reportDetailsExtras'));
    if (extras) {
      const domain = extras.domain;
      this.isTeamReport = domain === 'false' || domain == false
    }

    this.waitConfigurationServiceLoaded();
    // this.listenForSelectedProcessCellChanges();
  }

  ngOnChanges(changes) {
    const self = this;
    if (changes.selectedTabTitle && this.tabTitle) {
      if ((changes.selectedTabTitle.currentValue === this.tabTitle)  && ((this.dataLoaded == true) || (this.serverError == true))) {
        if (!this.serverError) {
          this.isLoading = false
          this.loadingFinished.emit(true);
        }
        am5.ready(() => {
          setTimeout(() => {
            this.drawChart();
          }, 100);
        });

      } else if (this.isFirstLoading == false) {
        if (this.root) {
          this.root.dispose();
          this.root = null;
        }
      }
    }
  }

  getMachineStatusColor(val) {
    return this.config.getMachineStatusColorFromStatusValue(val);
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    this.pc = (this.processCell ? this.processCell : this.selectedProcessCell);

    if( this.dateStart) {
      this.getChartData(this.dateStart, this.dateEnd)

    } else if( this.id) {
      this.schedulingService.getOrder(this.processCell, this.id).then(batch => {
        this.getChartData(batch.timeSeriesStart, batch.timeSeriesEnd)
      });
    } else {
      this.getChartData(null, null)
    }
  }



  getChartData(dateFrom, dateTo) {
    this.serverError = false;
    const pipe = new DatePipe(this.translate.currentLang);
    const getAllPoints = true;//this.isFirstLoading ? false : true;
    let startDate = dateFrom;
    let endDate = dateTo;

    this.maxDate = dateTo !== null ? new Date(dateTo) : null;
    this.minDate = dateTo !== null ? new Date(dateFrom) : null;
    this.minDate = new Date(pipe.transform(this.minDate, 'yyyy-MM-ddT00:00:00'))

    if (this.maxDate !== null && this.minDate !== null && this.isReport) {
      const extras = JSON.parse(localStorage.getItem('reportDetailsExtras'));
      this.domain = true;
      if (extras) {
        this.domain = extras.domain === false || extras.domain === 'false' ? false : true;
        if (!this.domain) {
          endDate = new Date(this.maxDate.toUTCString()).toISOString();
          startDate =  new Date(this.minDate.toUTCString()).toISOString();
        } else {
          endDate = new Date(this.maxDate.toUTCString()).toISOString();
          startDate = new Date(new Date(pipe.transform(this.maxDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();
        }
      } else {
        endDate = new Date(this.maxDate.toUTCString()).toISOString();
        startDate = new Date(new Date(pipe.transform(this.maxDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();
      }
    }

    if(new Date(this.dateStart).getTime() >= new Date(startDate).getTime()){
      startDate = this.dateStart;
    }
    if(new Date(this.dateEnd).getTime() <= new Date(endDate).getTime()){
      endDate = this.dateEnd;
    }



    this.rawDate = new Date(this.maxDate);
    setTimeout(() => {
      this.date = pipe.transform(this.maxDate, 'd MMM y');
    }, 100);

      this.integrationService.getShiftsEventsByProcessCellPath(dateFrom, dateTo, this.pc, null).then((shifts) => {
      this.shifts = [];
      if(shifts.length > 0) {
        shifts[0].values.map(el => {
          const obj = {
            time: new Date(el[0]).getTime(),
            oldTeam: el[2] == null ? "Undefined Team" : el[2],
            newTeam: el[1] == null ? "Undefined Team" : el[1],
          }
          this.shifts.push(obj);
        });
      }
      if (!this.chartData.find(el => el.date === this.date)) {
        this.getMachinesCurrentState(startDate, endDate, getAllPoints);
      } else {
        this.dailyChartData = this.chartData.find(el => el.date === this.date)?.data;

        this.dailyChartData.forEach(data => {
          // if (data.fromDate < new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')).getTime()) {
          //   data.fromDate = (new Date(new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')))).getTime();
          //   data.fromDateTooltip = pipe.transform(new Date(data.toDateTooltip), 'MM/dd 00:00:00');
          // }
        });
        this.series5.data.setAll(this.dailyChartData);
      }

    }).catch(error => {
      this.serverError = true;
      this.isLoading = false;
      this.loadingFinished.emit(true);
      this.chartData = [];
      this.dailyChartData = [];
      if (this.selectedTabTitle === this.tabTitle) {
        am5.ready(() => {
          setTimeout(() => {
            this.drawChart();
          }, 100);
        });
      }
    })
  }

  getMachinesCurrentState(startDate, endDate, getAllPoints) {
    this.isLoading = true;
    this.loadingFinished.emit(false);
    this.integrationService.getMachinesCurrentStateByProcessCellPath(startDate, endDate, this.pc, null, true, getAllPoints ).then((machinesStatus) => {
      this.chartRawData = machinesStatus;
      this.createDataForChart();
    }).catch(error => {
      this.serverError = true;
      this.isLoading = false;
      this.loadingFinished.emit(true);
      this.chartData = [];
      this.dailyChartData = [];
      if (this.selectedTabTitle === this.tabTitle) {
        am5.ready(() => {
          setTimeout(() => {
            this.drawChart();
          }, 100);
        });
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
    this.machines = [];
    this.numOfMachine = 0;


    //in case no machine in use, show all machine
    this.showMachineInUse = true
    this.chartRawData.machineStatuses.forEach(mac => {
      if (mac.isInUse === true) {
        this.showMachineInUse = false;
      }
    });

    for (var mac = 0; mac < this.chartRawData.machineStatuses.length; mac++) {
      if ( (this.chartRawData.machineStatuses[mac].isInUse == true || this.showMachineInUse == true)) {
        // let timeOverlapResult = multipleDateRangeOverlaps(this.chartRawData.machineStatuses[mac].statuses);
        // if (timeOverlapResult == true) {
        //   console.log("KODIS LOG: Date&Time overlaps in line status history chart",this.chartRawData.machineStatuses[mac].machineOrComponentName)
        // }
        this.numOfMachine = this.numOfMachine + 1

        const obj = {
          machineName: this.chartRawData.machineStatuses[mac].machineOrComponentName
        }
        this.machines.unshift(obj)

        for (var item = 0; item < this.chartRawData.machineStatuses[mac].statuses.length; item++) {
          let alarmText = null
          if (this.chartRawData.machineStatuses[mac].statuses[item].alarmText || this.chartRawData.machineStatuses[mac].statuses[item].alarmId) {
            this.translate.get(["OVERVIEW.Alarm"]).subscribe((translations) => {
              alarmText = '\n' + translations["OVERVIEW.Alarm"] + ": " + this.chartRawData.machineStatuses[mac].statuses[item].alarmText + ' (' + this.chartRawData.machineStatuses[mac].statuses[item].alarmId + ')';
            })
          }
          const obj = {
            machineName: this.chartRawData.machineStatuses[mac].machineOrComponentName,
            fromDate: (new Date(this.chartRawData.machineStatuses[mac].statuses[item].start)).getTime(),
            fromDateTooltip: this.chartRawData.machineStatuses[mac].statuses[item].start,
            toDate: (new Date(this.chartRawData.machineStatuses[mac].statuses[item].end)).getTime() ,
            toDateTooltip: this.chartRawData.machineStatuses[mac].statuses[item].end,
            color: am5.color(this.getMachineStatusColor(this.chartRawData.machineStatuses[mac].statuses[item].statusValue)),
            status: this.chartRawData.machineStatuses[mac].statuses[item].status,
            duration: this.secondsToHm(Math.round(this.chartRawData.machineStatuses[mac].statuses[item].duration*60)),
            alarmText: alarmText,
          };
          if (this.chartRawData.machineStatuses[mac].machineOrComponentName == null ||
            this.chartRawData.machineStatuses[mac].statuses[item].start == null ||
            this.chartRawData.machineStatuses[mac].statuses[item].end == null ||
            this.chartRawData.machineStatuses[mac].statuses[item].status == null ||
            this.chartRawData.machineStatuses[mac].statuses[item].duration == null) {
              console.log("MACHINE_STATUS_HISTORY chart with null value", this.chartRawData.machineStatuses[mac].machineOrComponentName,
              this.chartRawData.machineStatuses[mac].statuses[item].start,this.chartRawData.machineStatuses[mac].statuses[item].end)
            }
            const dateStart = new Date(this.chartRawData.machineStatuses[mac].statuses[item].start)
            const dateEnd = new Date(this.chartRawData.machineStatuses[mac].statuses[item].end)
          if (dateEnd > dateStart) {
            this.singledatechartData.push(obj)
          }
          if (!this.statusValue.includes(this.chartRawData.machineStatuses[mac].statuses[item].statusValue)) {
            const obj = {
              statusName: this.chartRawData.machineStatuses[mac].statuses[item].status,
              statusValue: this.chartRawData.machineStatuses[mac].statuses[item].statusValue
            }
            const legendObj = {
              name: this.chartRawData.machineStatuses[mac].statuses[item].status,
              color: am5.color(this.getMachineStatusColor(this.chartRawData.machineStatuses[mac].statuses[item].statusValue))
            }
            this.statusValue.push(this.chartRawData.machineStatuses[mac].statuses[item].statusValue)
            this.macStatus.push(obj)
            this.legendStatus.push(legendObj)
          }
        }
      }
    }

    if (this.maxDate === null && this.minDate === null) {
      this.maxDate = new Date(Math.max( ...this.singledatechartData.map(element => new Date(pipe.transform(new Date(element.toDate), 'd MMM y')).getTime() )));
      this.minDate = new Date(Math.min( ...this.singledatechartData.map(element => new Date(pipe.transform(new Date(element.fromDate), 'd MMM y')).getTime() )));
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

    // this.dailyChartData.forEach(data => {
    //   if (data.fromDate < new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')).getTime()) {
    //     data.fromDate = (new Date(new Date(pipe.transform(new Date(data.toDate), 'd MMM y 00:00:00')))).getTime();
    //     data.fromDateTooltip = data.toDateTooltip;
    //   }
    // });


    this.dataLoaded = true;
    if(this.selectedTabTitle === this.tabTitle) {
        this.dailyChartData.reverse();
        // this.machines.reverse();
        if (this.isFirstLoading) {
          am5.ready(() => {
            setTimeout(() => {
              this.drawChart();
            }, 100);
          });
        } else {

          this.series5.data.setAll(this.dailyChartData);
          this.isLoading = false;
          this.loadingFinished.emit(true);
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

    // this.chart.events.on('ready', () => {
    //   this.isLoading = false;

    //   am4core.ready(function() {
    //     setTimeout(function () {
    //       if (self.isFirstLoading) {
    //         self.isFirstLoading = false
    //         self.updateTargetProcessCellData()
    //       }
    //     }, 1000);
    //   })

    // });

    drawChart() {
      const self = this;

      this.root = am5.Root.new(this.chartId);

      this.root.dateFormatter.set("intlLocales", this.lang);
      this.root.numberFormatter.set("intlLocales", this.lang);

      this.root.dateFormatter.setAll({dateFormat: { year:'numeric', month: '2-digit', "day": '2-digit',"hour": "numeric", "minute": "numeric" }, dateFields: ['fromDateTooltip','toDateTooltip'],});

            // this.root.dateFormatter.setAll({
      //   dateFormat: "yyyy-MM-dd",
      //   dateFields: ["valueX", "openValueX"]
      // });

      // this.root.setThemes([
      //   am5themes_Animated.new(this.root)
      // ]);

      let chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: this.root.verticalLayout
      }));

      //Category axix
      let categoryAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(this.root, {
          categoryField: "machineName",
          renderer: am5xy.AxisRendererY.new(this.root, {
            minGridDistance: 10,
          }),
          tooltip: am5.Tooltip.new(this.root, {})
        })
      );
      categoryAxis.data.setAll(this.machines)

      //Category axix labels
      let fontSize = 10;
      if (this.numOfMachine <= 15) {
        fontSize = 14;
      } else if (this.numOfMachine <= 30) {
        fontSize = 12;
      } else if (this.numOfMachine > 50) {
        fontSize = 8;
      }
      let catRenderer = categoryAxis.get("renderer");
      catRenderer.labels.template.setAll({
        fontSize: fontSize
      });


      if (!this.isReport) {
        //X axix (now, -1h, -2h...)
        const pcData = this.configurationService.getSelectedProcessCell();
        const numOfH = Number(pcData.areaSettings.numberOfHoursDisplayedOnOverview);
          let hourAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(this.root, {
              maxDeviation: 1,
              min: -numOfH,
              max: 0,
              renderer: am5xy.AxisRendererX.new(this.root, {minGridDistance: 60,}),
            })
          );
          hourAxis.get('renderer').labels.template.adapters.add('text', (text, target): string => {
            return +text === 0 ? 'now' : text + 'h';
          });
      }

      let dateAxis = chart.xAxes.push(
        am5xy.DateAxis.new(this.root, {
          baseInterval: { timeUnit: "minute", count: 1 },
          renderer: am5xy.AxisRendererX.new(this.root, {
            minGridDistance: 92,
            opposite: true,
          }),
          tooltip: am5.Tooltip.new(this.root, {}),
          startLocation: 0.5,
          endLocation: 0.5,
          y: am5.p50
        })
      );
      if (this.isReport) {
        dateAxis.get("periodChangeDateFormats")["hour"] = { "hour": "numeric", "minute": "numeric" };
        dateAxis.get("periodChangeDateFormats")["minute"] = { "hour": "numeric", "minute": "numeric" };
        dateAxis.get("periodChangeDateFormats")["second"] = { "hour": "numeric", "minute": "numeric" };
        dateAxis.get("dateFormats")["hour"] = { "hour": "numeric", "minute": "numeric" };
        dateAxis.get("dateFormats")["minute"] = { "hour": "numeric", "minute": "numeric" };
        dateAxis.get("dateFormats")["second"] = { "hour": "numeric", "minute": "numeric" };
      } else {
        dateAxis.get("periodChangeDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
        dateAxis.get("periodChangeDateFormats")["minute"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
        dateAxis.get("periodChangeDateFormats")["second"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
        dateAxis.get("dateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
        dateAxis.get("dateFormats")["minute"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
        dateAxis.get("dateFormats")["second"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
      }



      let dateRenderer = dateAxis.get("renderer");
      dateRenderer.labels.template.setAll({
        location: 0.5
      });
      if (!this.isReport) {
        dateRenderer.grid.template.setAll({
          disabled: true,
          strokeOpacity: 0
        });
      }


      this.series5 = chart.series.push(am5xy.ColumnSeries.new(this.root, {
        xAxis: dateAxis,
        yAxis: categoryAxis,
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
        tooltipText: "[bold]{status} [\]({duration}"  + "): \n" + fromText + ": {fromDateTooltip}  \n" + toText + ": {toDateTooltip} {alarmText}",
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
      this.series5.data.setAll(this.dailyChartData);
      this.series5.events.on("datavalidated", function(ev) {
        self.isLoading = false;
        self.loadingFinished.emit(true);

        setTimeout(function () {
          if (self.isFirstLoading) {
            self.isFirstLoading = false
            // self.updateTargetProcessCellData()
          }
        }, 1000);
      });

      // Add scrollbars
      chart.set("scrollbarX", am5.Scrollbar.new(this.root, {
        orientation: "horizontal",
        y: am5.p0
      }));

      // //Add cursor
      // chart.set("cursor", am5xy.XYCursor.new(this.root, {
      //   xAxis: dateAxis,
      // }));



      //Legend
      let legend = chart.children.push(am5.Legend.new(this.root, {
        nameField: "name",
        fillField: "color",
        strokeField: "color",
        centerX: am5.p50,
        x: am5.p50
      }))
      legend.data.setAll(this.legendStatus);


      //Add axis range with teams name
      if (!this.isTeamReport) {
        for(let item of this.shifts){

          //Old team
          var teamOldDataItem = dateAxis.makeDataItem({
            value: new Date(item.time).getTime(),
            above: true
          });
          // Create a range
          var teamOldRange = dateAxis.createAxisRange(teamOldDataItem);
          teamOldDataItem.get("grid").setAll({
            stroke: am5.color(this.config.getColor('black')),
            strokeOpacity: 1,
            strokeWidth: 3
          });
          teamOldDataItem.get("label").setAll({
            inside: false,
            text: item.oldTeam,
            fill: am5.color(this.config.getColor('black')),
            fontSize: 14,
            fontWeight: "bold",
            paddingRight: 14,
            centerX: am5.p100,
            // x: am5.p0,
            // y:  am5.p100,
            centerY: am5.p0,

          });

          //New team
          var teamNewDataItem = dateAxis.makeDataItem({
            value: new Date(item.time).getTime(),
            above: true
          });
          // Create a range
          var teamNewRange = dateAxis.createAxisRange(teamNewDataItem);
          teamNewDataItem.get("grid").setAll({
            stroke: am5.color(this.config.getColor('black')),
            strokeOpacity: 1,
            strokeWidth: 3
          });
          teamNewDataItem.get("label").setAll({
            inside: false,
            text: item.newTeam,
            fill: am5.color(this.config.getColor('black')),
            fontSize: 14,
            fontWeight: "bold",
            paddingLeft: 10,
            centerX: am5.p0,
            // x: am5.p50,
            // y:  am5.p100,
            centerY: am5.p0,

          });

        }
      }

      //Data Export
      if (this.canExportData) {
        let exporting = am5exporting.Exporting.new(this.root, {
          menu: am5exporting.ExportingMenu.new(this.root, {
            align: "left",
          }),
          dataSource: this.dailyChartData
        });
      }

      this.showIndicator();

      if (this.chartData.length == 0) {
        this.indicator.show();
      } else {
        if (this.indicator) {
          this.indicator.hide()
          this.noData = false;
        }
      }



      // this.series5.appear();
      // chart.appear(1000, 100);


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
      } else {
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

  closeModal() {
    this.ref.close(true);
  }

  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }
  /**
   * LISTENERS
   */


  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if ((loaded === true) ) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
