import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IntegrationData } from '../../../../@core/data/integration';
import { NbDialogService } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import {TranslateService} from '@ngx-translate/core';
import { SchedulingData } from '../../../data/scheduling';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import { DowntimeAlarmsDetailsChartComponent } from '../downtime-alarms-details-chart/dowtime-alarms-details-chart.component';

import { Subscription } from 'rxjs';
import { BaseClass } from '../../common/base-class/base-class';

@Component({
  selector: 'ngx-machine-downtime-chart',
  styleUrls: ['./machine-downtime-chart.component.scss'],
  templateUrl: './machine-downtime-chart.component.html',
})

export class MachineDowntimeComponent extends BaseClass implements OnInit {


  @Input() id;
  @Input() chartId = 'downtimeMachineChart';


  data = [];
  reasonArray = [];

  isFirstLoading = false;
  showInfo = false;

  maxTot = 0;
  numOfMachine = 0;

  chart: am4charts.XYChart;
  categoryAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>;
  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;

  pcSub: Subscription;
  loadSub: Subscription;
  indicator: any;
  series: am4charts.ColumnSeries;

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
    this.isFirstLoading = true;
    this.showInfo = false;
  }

  ngAfterViewInit(): void {
    this.waitConfigurationServiceLoaded();
  }


  updateTargetProcessCellData() {
    if(this.processCellPath && this.dateStart){
      this.integrationService.getDowntimeMachinesByProcessCellPath(this.processCellPath, this.dateStart, this.dateEnd).then((res) => {
        this.data = res.machineDowntimes;
        this.drawChart();
      });
    } else if(this.processCellPath && this.id){
      this.scheduleService.getOrder(this.processCellPath, this.id).then(batch => {
        this.integrationService.getDowntimeMachinesByProcessCellPath(this.processCellPath, batch.timeSeriesStart, batch.timeSeriesEnd).then((res) => {
          this.data = res.machineDowntimes;
          this.drawChart();
        });
      });
    }
  }

  dataForChart() {
    this.numOfMachine = 0;
    for(var i = 0; i < this.data.length; i++){
      this.numOfMachine = this.numOfMachine + 1
      this.data[i]["none"] = 0
      if (this.maxTot < this.data[i].duration) {
        this.maxTot = this.data[i].duration;
      }
      for(var k = 0; k < this.data[i].reasons.length; k++){
        const reasonName = this.data[i].reasons[k].reasonName
        const duration = this.data[i].reasons[k].duration
        this.data[i][reasonName] = duration
        if (!this.reasonArray.includes(reasonName)) {
          this.reasonArray.push(reasonName)
        }
      }
    }
  }

  openAlarmsChart(reason,data) {
    const obj = {
      reasonName: reason,
      chartData: data,
      isJustifyReason : false,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd
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
    this.chart.data = this.data;
    this.chart.paddingRight = 20;
    this.chart.paddingTop = 30;
    this.chart.paddingBottom = 30;
    this.chart.durationFormatter.durationFormat = "hh'h' mm'min' ss's'"

    if (this.canExportData) {
      this.chart.exporting.menu = new am4core.ExportMenu();
      this.chart.exporting.menu.align = "left"
    }

    var categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "machineOrComponentName";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.cellStartLocation = 0.2;
    categoryAxis.renderer.cellEndLocation = 0.8;
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.grid.template.disabled = true;


    var  valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = this.maxTot + (this.maxTot * 0.15);  //add 15% to maximum to leave space for label with total discarded
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.calculateTotals = true;

    // self.translate.get(["COMMON.Seconds"]).subscribe((translations) => {
    //   valueAxis.title.text = translations["COMMON.Seconds"];
    // });


    if (self.reasonArray.length > 0) {
      for (var i = 0; i < self.reasonArray.length; i++) {
        this.createSeries(self.reasonArray[i], self.reasonArray[i], true,i);
      }
    } else {
      self.isLoading = false;
      self.loadingFinished.emit(true);
      self.showInfo = true;
    }

    this.createTotalLabel()


    //Legend
    this.chart.legend = new am4charts.Legend();
    this.chart.legend.paddingTop = 10
    this.chart.legend.position = "bottom";
    let markerTemplate = this.chart.legend.markers.template;
    this.chart.legend.fontSize = 12;
    markerTemplate.width = 15;
    markerTemplate.height = 15;


    //Auto-adjusting chart height based on a number of data items
    let cellSize = 40; // Set cell size in pixels
    let minChartHeight = this.data.length > 0 ? 180 : 110;
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

  createSeries(field, name, stacked,index) {
    this.series = this.chart.series.push(new am4charts.ColumnSeries());
    this.series.dataFields.valueX = field;
    this.series.dataFields.categoryY = "machineOrComponentName";
    this.series.name = name;
    this.series.columns.template.tooltipText = "{name}: [bold]{valueX.value.formatDuration()}";
    this.series.stacked = true;
    this.series.columns.template.height = 20;

    //Create action on hit to open alarms details modal
    this.series.columns.template.events.on(
      "hit",
      ev => {
        const data = ev.target.dataItem.dataContext;
        const reason = ev.target.dataItem.component["name"];
        this.openAlarmsChart(reason,data);
      },
      this
    );

    //Series ready to appear
    this.series.events.on('ready', () => {
      if (index == this.reasonArray.length - 1) {
        this.isLoading = false;
        this.loadingFinished.emit(true);
        this.showInfo = this.data?.length > 0 ? true : false;
      }
  })
  }

  createTotalLabel(){
    // Create series for total
    this.series = this.chart.series.push(new am4charts.ColumnSeries());
    this.series.dataFields.valueX = "none";
    this.series.dataFields.categoryY = "machineOrComponentName";
    this.series.stacked = true;
    this.series.hiddenInLegend = true;
    this.series.columns.template.strokeOpacity = 0;

    //Label
    var labelBullet = this.series.bullets.push(new am4charts.LabelBullet())
    labelBullet.label.horizontalCenter = "left";
    labelBullet.label.dx = 10;
    labelBullet.label.text = "{valueX.total.formatDuration()}";
    labelBullet.locationX = 1;
    labelBullet.label.hideOversized = false;
    labelBullet.label.truncate = false;
    labelBullet.label.fontSize = 12;
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
