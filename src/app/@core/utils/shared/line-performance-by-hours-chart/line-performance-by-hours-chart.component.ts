import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NbDialogRef,NbColorHelper } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import { IntegrationData } from '../../../data/integration';
import { SchedulingData } from '../../../data/scheduling';

import { Subscription } from 'rxjs';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_rangeSelector from "@amcharts/amcharts4/plugins/rangeSelector";
import { BaseClass } from '../../common/base-class/base-class';

@Component({
  selector: 'ngx-line-performance-by-hours-chart',
  styleUrls: ['./line-performance-by-hours-chart.component.scss'],
  templateUrl: './line-performance-by-hours-chart.component.html',
})

export class LinePerformanceByHoursComponent extends BaseClass implements OnInit {

  @Input() dateStart;
  @Input() dateEnd;
  @Input() id;

  selectedProcessCell: any;

  chartDataValues: any = [];

  performanceArray = [];
  performanceValues
  UoM;
  perc;
  idealPieces;
  pcSub: Subscription;
  loadSub: Subscription;
  chartId = 'linePerformByHoursChart';

  chart: am4charts.XYChart;
  xAxisDate: am4charts.DateAxis<am4charts.AxisRenderer>;
  xAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>

  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;
  seriesSP: am4charts.ColumnSeries;
  seriesPV: am4charts.ColumnSeries;
  bulletSP: am4charts.LabelBullet;
  bulletPV: am4charts.LabelBullet;
  indicator: am4core.Container;

  isFirstLoading = false;
  serverError = false;

  periodicRepeat;
  lang = 'en';

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private translate: TranslateService,
    protected ref: NbDialogRef<LinePerformanceByHoursComponent>,
    private scheduleService: SchedulingData,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);
    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.lang = lang;
  }

  ngOnInit() {
    this.isLoading = true;
    this.isFirstLoading = true;
    this.waitConfigurationServiceLoaded();
    this.listenForSelectedProcessCellChanges();
    // if (!this.isReport) {
    //   this.setPeriodicRefresh();
    // }
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  closeModal() {
    this.ref.close(true);
  }

  // setPeriodicRefresh() {
  //   const interval = this.config.getTimedUpdateMs();
  //   this.periodicRepeat = window.setInterval(() => {
  //     this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
  //     if(this.selectedProcessCell) {
  //       this.updateTargetProcessCellData();
  //     }
  //   }, interval)
  // }

  // updatePeriodicRefresh() {
  //   clearInterval(this.periodicRepeat);
  //   if (!this.isReport) {
  //     this.setPeriodicRefresh();
  //   }
  // }

  // cancelPeriodicRefresh() {
  //   clearInterval(this.periodicRepeat);
  // }



  // ngOnChanges(changes: SimpleChanges) {
  //   this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
  //   this.isFirstLoading = true;
  //   if(changes.dateStart) {
  //     this.updateTargetProcessCellData();
  //   }
  // }



  updateTargetProcessCellData() {
    this.serverError = false;
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    const pc = (this.processCellPath ? this.processCellPath : this.selectedProcessCell.path);
    this.UoM = this.configurationService.getUoMByProcessCellPath(pc);
    if( this.dateStart && pc) {
      this.integrationService.getProducedPartsSPPVEveryHour(pc, this.dateStart, this.dateEnd, null).then((SPPV) => {
        this.performanceValues = SPPV.machinePerformances;
        this.updateChartData();
      }).catch(error => {
        this.updateWithServerError()
      }); 
    } else if( this.id && pc) {
      this.scheduleService.getOrder(pc, this.id).then(batch => {
        this.integrationService.getProducedPartsSPPVEveryHour(pc, batch.timeSeriesStart, batch.timeSeriesEnd, null).then((SPPV) => {
          this.performanceValues = SPPV.machinePerformances;
          this.updateChartData();
          }).catch(error => {
            this.updateWithServerError()
          });
        }).catch(error => {
          this.updateWithServerError()
        });
    } else if(pc) {
      this.integrationService.getOEECurrentBatch(pc).then((oee) => {
        if (oee.operatingTime > 0) {
          this.integrationService.getProducedPartsSPPVEveryHour(pc, oee.consideredTimeRange.startTimestamp, oee.consideredTimeRange.endTimestamp, null).then((SPPV) => {
            // console.log('3 ==> ',SPPV)
            this.UoM = oee.uoM;
            this.performanceValues = SPPV.machinePerformances;
            this.updateChartData();
          }).catch(error => {
            this.updateWithServerError()
          });
        } else {
          this.isLoading = false;
          this.loadingFinished.emit(true);
        }
      }).catch(error => {
        this.updateWithServerError()
      });
    }
  }

  updateWithServerError() {
    this.serverError = true;
    this.chartDataValues = [];
    this.performanceValues = [];
    this.updateChartData();
  }

  stringToSec(t) {
    //String format: hh:mm.ss
    return Number(t.split(':')[2]) + Number(t.split(':')[1])*60+Number(t.split(':')[0]*3600);
  }

  updateChartData() {
    const self = this;
    this.isLoading = false;
    this.loadingFinished.emit(true);
    if (!this.chart) {
      return
    }

    self.chartDataValues = [];
    var maxVal = 0;
    let now = new Date()

    if (this.performanceValues.length > 0) {
        this.performanceValues.forEach( item => {
        const time = item.time;
        const PV = item.actualPieces;
        const SP = item.targetPieces;
        if (PV > maxVal) {
          maxVal = PV
        }
        if (SP > maxVal) {
          maxVal = SP
        }
        let timeDate = new Date(time)
        var diff = (Math.round(Math.abs(timeDate.getTime() - now.getTime()) / 3600000)) - 1 ;
        // if (diff > 0) {
        //   diff = diff * -1
        // }
        self.chartDataValues.push({
          "setPoint": Math.round(SP * 10) / 10 ,
          "actual": Math.round(PV * 10) / 10 ,
          "time": time,
          "timeName": diff > 0 ? String(diff * -1) + "h" : "now",
        });
      // }
      });
    }

    //Chart data
    this.chart.data = this.chartDataValues;
    this.valueAxis.max = maxVal + (maxVal * 0.1);
    this.valueAxis.title.text = this.UoM;

    //Scroll bar parameters
    let pcData = this.configurationService.getSelectedProcessCell();
    var durationTimeHours = 0;
    var lastPoint
    var lastToZoom
    var firstToZoom
    if (this.chartDataValues.length > 0) {
      let firstPoint = new Date(this.chartDataValues[0].time);
      lastPoint = new Date(this.chartDataValues[this.chartDataValues.length-1].time);
      lastToZoom = new Date(this.chartDataValues[this.chartDataValues.length-1].time)
      //"Round" time to next hour to zoom in correct position
      lastToZoom.setHours(lastToZoom.getHours()+ 1.0) ;
      lastToZoom.setMinutes(0)

      if (this.chartDataValues.length > pcData.areaSettings.numberOfHoursDisplayedOnOverview) {
        firstToZoom = new Date(this.chartDataValues[this.chartDataValues.length-pcData.areaSettings.numberOfHoursDisplayedOnOverview-1].time)
      } else {
        firstToZoom = firstPoint;
      }
      const durationTime = lastPoint.getTime() - firstPoint.getTime();
      durationTimeHours = Math.ceil(durationTime / (1000 * 3600 ));
    }
    var sbEnd = pcData.areaSettings.numberOfHoursDisplayedOnOverview / durationTimeHours;
    if (sbEnd >= 1 ) {
      sbEnd = 1;
      this.chart.scrollbarX.hide();
    } else {
      //Force scrollbar to last point
      this.chart.events.on("datavalidated", function() {
        setTimeout(function() {
        self.xAxisDate.zoomToDates(firstToZoom, lastToZoom);
        }, 100)
      });

    }
    this.chart.scrollbarX.end = sbEnd;

    //Tooltip
    this.seriesSP.columns.template.tooltipText = "{valueY}" + " (" + this.UoM + ")";
    this.seriesPV.columns.template.tooltipText = "{valueY}" + " (" + this.UoM + ")";

    //Legend
    self.translate.get(["COMMON.Ideal_per_hour"]).subscribe((translations) => {
      this.seriesSP.name = translations["COMMON.Ideal_per_hour"] + " (" + this.UoM + "/h)";
    });
    self.translate.get(["COMMON.Pieces_per_hours"]).subscribe((translations) => {
      this.seriesPV.name = translations["COMMON.Pieces_per_hours"] + " (" + this.UoM + "/h)";
    });

    //Labels
    this.bulletSP.label.text = '{valueY}'
    this.bulletPV.label.text = '{valueY}'



    if ((!this.chartDataValues) || (this.chartDataValues.length == 0) || (!this.UoM)) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

  }

  //Show no data available in case of null data
  showIndicator() {
    this.indicator = this.chart.tooltipContainer.createChild(am4core.Container);
    this.indicator.background.fill = am4core.color("#fff");
    this.indicator.background.fillOpacity = 1.0;
    this.indicator.width = am4core.percent(100);
    this.indicator.height = am4core.percent(100);

    let indicatorLabel = this.indicator.createChild(am4core.Label);

    if (this.serverError === true) {
      this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
        indicatorLabel.text = translations["SHARED.Server_Error_While_Data_Loading"];
      });
    } else {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        indicatorLabel.text = translations["SHARED.No_Data_Available"];
      });
    }
    indicatorLabel.align = "center";
    indicatorLabel.valign = "middle";
    indicatorLabel.fontSize = 20;
  }

  drawChart() {
    const self = this;
    am4core.useTheme(am4themes_animated);

    this.chart = am4core.create(this.chartId, am4charts.XYChart);
    this.chart.paddingTop = 30;

    // Use only absolute numbers
    this.chart.numberFormatter.numberFormat = "#.#s";

    if (this.canExportData) {
      this.chart.exporting.menu = new am4core.ExportMenu();
    }

    // this.chart.dateFormatter.dateFormat = "yyyy-MM-ddTHH:mm:ssZ";
    this.chart.dateFormatter.inputDateFormat = "yyyy-MM-ddTHH:mm:ssZ";
    this.chart.dateFormatter.intlLocales = this.lang;
    this.chart.dateFormatter.dateFormat = { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };

    this.showIndicator();

    //Colors
    this.chart.colors.list = [
      am4core.color(this.config.getColor('primary')),
      am4core.color(this.config.getColor('success'))
    ];

    //Sroll bar
    this.chart.scrollbarX = new am4core.Scrollbar();
    this.chart.scrollbarX.parent = this.chart.bottomAxesContainer;
    this.chart.scrollbarX.startGrip.hide();
    this.chart.scrollbarX.endGrip.hide();
    this.chart.scrollbarX.start = 0;
    this.chart.scrollbarX.end = 1;

    this.chart.zoomOutButton = new am4core.ZoomOutButton();
    this.chart.zoomOutButton.hide();

    // //Legend
    this.chart.legend = new am4charts.Legend()
    this.chart.legend.position = 'bottom'
    this.chart.legend.paddingTop= 10
    this.chart.legend.labels.template.maxWidth = 95;

    let markerTemplate = this.chart.legend.markers.template;
    markerTemplate.width = 13;
    markerTemplate.height = 13;


    if (this.dateStart || this.id) {
      //Set date label formatting
      this.xAxisDate = this.chart.xAxes.push(new am4charts.DateAxis())
      this.xAxisDate.dateFormatter.dateFormat = "yyyy-MM-ddTHH:mm:ssZ";
      this.xAxisDate.baseInterval = { count: 1, timeUnit: "hour" };
      // this.xAxisDate.dateFormats.setKey("hour", "dd/M H:mm");
      // this.xAxisDate.periodChangeDateFormats.setKey("hour", "dd/M H:mm");

      this.xAxisDate.dateFormats.setKey("hour", { "month": "numeric", "day": "numeric", "hour": "numeric", "minute": "numeric"  });
      this.xAxisDate.periodChangeDateFormats.setKey("hour", { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" });
      this.xAxisDate.tooltipDateFormat = { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };

      this.xAxisDate.renderer.cellStartLocation = 0.1;
      this.xAxisDate.renderer.cellEndLocation = 0.9;
      this.xAxisDate.renderer.labels.template.fontSize = 11;
      this.xAxisDate.renderer.grid.template.disabled = true;

      this.xAxisDate.gridIntervals.setAll([
        { timeUnit: "hour", count: 1 },
      ]);
    } else {
      this.xAxis = this.chart.xAxes.push(new am4charts.CategoryAxis())
      this.xAxis.dataFields.category = "timeName";
      this.xAxis.renderer.minGridDistance = 20;
      this.xAxis.renderer.grid.template.disabled = true;

    }


    // Create value axis
    this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis.min = 0;
    this.valueAxis.renderer.cellStartLocation = 0.1;
    this.valueAxis.renderer.cellEndLocation = 0.9;

    // Create series
    this.seriesSP = this.chart.series.push(new am4charts.ColumnSeries());
    this.seriesSP.dataFields.valueY = "setPoint";
    // this.seriesSP.name = "timeName";
    this.seriesSP.clustered = true;
    this.seriesSP.columns.template.column.cornerRadiusTopRight = 10;
    this.seriesSP.columns.template.column.cornerRadiusTopLeft = 10;
    // this.seriesSP.columns.template.width = am4core.percent(80);
    this.seriesSP.columns.template.width = 30;
    this.seriesSP.columns.template.width = am4core.percent(80);;



    this.bulletSP = this.seriesSP.bullets.push(new am4charts.LabelBullet())
    this.bulletSP.interactionsEnabled = false
    this.bulletSP.dy = -10;
    this.bulletSP.label.fill = am4core.color('#000000')
    this.bulletSP.fontSize = 12;

    this.seriesPV = this.chart.series.push(new am4charts.ColumnSeries());
    this.seriesPV.dataFields.valueY = "actual";
    // this.seriesPV.name = "timeName";
    this.seriesPV.clustered = true;
    this.seriesPV.columns.template.column.cornerRadiusTopRight = 10;
    this.seriesPV.columns.template.column.cornerRadiusTopLeft = 10;
    // this.seriesPV.columns.template.width = am4core.percent(80);
    this.seriesPV.columns.template.width = am4core.percent(80);;


    this.bulletPV = this.seriesPV.bullets.push(new am4charts.LabelBullet())
    this.bulletPV.interactionsEnabled = false
    this.bulletPV.dy = -10;
    this.bulletPV.label.fill = am4core.color('#000000')
    this.bulletPV.fontSize = 12;

    if (this.dateStart || this.id) {
      this.seriesSP.dataFields.dateX = "time";
      this.seriesPV.dataFields.dateX = "time";
    } else {
      this.seriesSP.dataFields.categoryX = "timeName";
      this.seriesPV.dataFields.categoryX = "timeName";
    }

  }



  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    // this.cancelPeriodicRefresh();
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }

  }

  /**
   * LISTENERS
   */

listenForSelectedProcessCellChanges() {
  this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.isLoading = true;
        this.selectedProcessCell = selectedProcessCell;
        if (this.chart) {
          this.chart.dispose();
          if (this.indicator) {
            this.indicator = null;
          }
          this.drawChart()
        }
        this.updateTargetProcessCellData();
        // this.updatePeriodicRefresh();
        this.isFirstLoading = true;
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub =  this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }
}
