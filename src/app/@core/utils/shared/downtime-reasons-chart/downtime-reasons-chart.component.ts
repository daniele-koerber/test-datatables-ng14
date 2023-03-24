import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IntegrationData } from '../../../../@core/data/integration';
import { NbDialogService } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import {TranslateService} from '@ngx-translate/core';
import { SchedulingData } from '../../../data/scheduling';
import { DowntimeAlarmsDetailsChartComponent } from '../downtime-alarms-details-chart/dowtime-alarms-details-chart.component';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_material from "@amcharts/amcharts4/themes/material";

import { Subscription } from 'rxjs';
import { BaseClass } from '../../common/base-class/base-class';

@Component({
  selector: 'ngx-downtime-reasons-chart',
  styleUrls: ['./downtime-reasons-chart.component.scss'],
  templateUrl: './downtime-reasons-chart.component.html',
})

export class DowntimeReasonsComponent extends BaseClass implements OnInit {

  @Input() id;
  @Input() chartId = 'downtimeReasonChart';

  data = [];

  isFirstLoading = false;
  showInfo = false;

  pcSub: Subscription;
  loadSub: Subscription;
  maxTot = 0;

  chart: am4charts.XYChart;
  categoryAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>;
  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;
  series: am4charts.ColumnSeries;
  indicator: any;

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private translate: TranslateService,
    private scheduleService: SchedulingData,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);
    am4core.options.queue = true;
  }

  ngOnInit() {
    this.isLoading = true;
    this.showInfo = false;
    this.isFirstLoading = true;
  }

  ngAfterViewInit(): void {
    this.waitConfigurationServiceLoaded();
  }

  updateTargetProcessCellData() {
    if (this.processCellPath) {
      if( this.dateStart){
        this.integrationService.getDowntimeReasonsByProcessCellPath(this.processCellPath, this.dateStart, this.dateEnd).then((res) => {
          this.data = res.downtimeReasons;
          this.drawChart();
        });
      } else if (this.id) {
        this.scheduleService.getOrder(this.processCellPath, this.id).then(batch => {
          this.integrationService.getDowntimeReasonsByProcessCellPath(this.processCellPath, batch.timeSeriesStart, batch.timeSeriesEnd).then((res) => {
            this.data = res.downtimeReasons;
            this.drawChart();
          });
        });
      }
    }
  }


  dataForChart() {

    for(var i = 0; i < this.data.length; i++){
      this.data[i]["none"] = 0
      if (this.maxTot < this.data[i].duration) {
        this.maxTot = this.data[i].duration;
      }
      const reasonName = this.data[i].reasonName
      const duration = this.data[i].duration
      this.data[i][reasonName] = duration
    }

  }

  openAlarmsChart(reason,data) {
    const obj = {
      reasonName: reason,
      chartData: data,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      isJustifyReason : true,
    };
    const ref = this.dialogService.open(DowntimeAlarmsDetailsChartComponent, {
      context: obj as Partial<DowntimeAlarmsDetailsChartComponent>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {

    });
  }

  drawChart() {
    const self = this;

    this.dataForChart()

    am4core.useTheme(am4themes_material);

    this.chart = am4core.create(self.chartId, am4charts.XYChart);
    this.data.reverse();
    this.chart.data = self.data;
    this.chart.paddingRight = 20;
    this.chart.paddingTop = 30;
    this.chart.paddingBottom = 30;
    this.chart.durationFormatter.durationFormat = "hh'h' mm'min' ss's'"

    if (this.canExportData ) {
      this.chart.exporting.menu = new am4core.ExportMenu();
      this.chart.exporting.menu.align = "left"
    }

    var categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "reasonName";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.cellEndLocation = 0.9;
    categoryAxis.renderer.grid.template.disabled = true;

    var  valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = this.maxTot + (this.maxTot * 0.15);  //add 15% to maximum to leave space for label with total discarded
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;

    // self.translate.get(["COMMON.Seconds"]).subscribe((translations) => {
    //   valueAxis.title.text = translations["COMMON.Seconds"];
    // });

    this.series = this.chart.series.push(new am4charts.ColumnSeries());
    this.series.dataFields.categoryY = "reasonName";
    this.series.dataFields.valueX = "duration";
    this.series.columns.template.strokeOpacity = 0;
    this.series.stacked = false;
    this.series.name = "reasonName";
    this.series.columns.template.tooltipText = "[bold]{valueX.value.formatDuration()}";
    this.series.columns.template.height = 20;

    //Series ready to appear
    this.series.events.on('ready', () => {
      this.isLoading = false;
      this.loadingFinished.emit(true);
      this.showInfo = this.data?.length > 0 ? true : false;
    })

    //Create action on hit to open alarms details modal
    this.series.columns.template.events.on(
      "hit",
      ev => {
        const data = ev.target.dataItem.dataContext;
        const reason = ev.target.dataItem.component["name"];
        self.openAlarmsChart(reason,data);
      },
    );

    //Label
    var labelBullet = this.series.bullets.push(new am4charts.LabelBullet())
    labelBullet.label.horizontalCenter = "left";
    labelBullet.label.dx = 10;
    labelBullet.label.text = "{duration.formatDuration()}";
    // labelBullet.locationX = 1;
    labelBullet.label.hideOversized = false;
    labelBullet.label.truncate = false;
    labelBullet.label.fontSize = 12;


    //Auto-adjusting chart height based on a number of data items
    let cellSize = 40; // Set cell size in pixels
    let minChartHeight = 110;
    this.chart.events.on("datavalidated", function(ev) {

      // Get objects of interest
      let chart = ev.target;
      let categoryAxis = chart.yAxes.getIndex(0);

      // Calculate how we need to adjust chart height
      let adjustHeight = chart.data.length * cellSize;

      // get current chart height
      let targetHeight = minChartHeight + adjustHeight;

      // Set it on chart's container
      chart.svgContainer.htmlElement.style.height = targetHeight + "px";
    });

    this.showIndicator();

    if ((!this.data) || (this.data.length == 0)) {
      this.indicator.show();
      self.isLoading = false;
      self.loadingFinished.emit(true);
      self.showInfo = false;
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }


  }

  //Indicator no data available
  showIndicator() {
    this.indicator = this.chart.tooltipContainer.createChild(am4core.Container);
    this.indicator.background.fill = am4core.color("#fff");
    this.indicator.background.fillOpacity = 1.0;
    this.indicator.width = am4core.percent(100);
    this.indicator.height = am4core.percent(100);

    let indicatorLabel = this.indicator.createChild(am4core.Label);

    this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
      indicatorLabel.text = translations["SHARED.No_Data_Available"];
    });
    indicatorLabel.align = "center";
    indicatorLabel.valign = "middle";
    indicatorLabel.fontSize = 20;
  }

  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    // Clean up chart when the component is removed
      if (this.chart) {
        this.chart.dispose();
      }
    }


  timeConvert(n) {
    const num = n/60;
    const hours = (num / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.floor(minutes);
    const seconds = (minutes - rminutes) * 60;
    const rseconds = Math.floor(seconds);
    return (rhours !== 0 ? `${rhours}h` : '') + ` ${rminutes}min` + ` ${rseconds}s`;
  }

  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.isLoading = true;
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
