import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import { ConfigService } from '../../services/config.service';
import { AlarmsTimelineChartComponent } from '../alarm-timeline-chart/alarm-timeline-chart.component';
import { BaseClass } from '../../common/base-class/base-class';

@Component({
  selector: 'ngx-downtime-alarms-details-chart',
  styleUrls: ['./dowtime-alarms-details-chart.component.scss'],
  templateUrl: './dowtime-alarms-details-chart.component.html',
})

export class DowntimeAlarmsDetailsChartComponent extends BaseClass implements OnInit{

  @Input() reasonName;
  @Input() chartData;
  @Input() dateStart;
  @Input() dateEnd;
  @Input() isJustifyReason;

  data = [];
  machineName = '';
  maxTot = 0;

  showInfo = false;

  chart: am4charts.XYChart;
  categoryAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>;
  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;
  series: am4charts.ColumnSeries;


  chartId = "downtime-alarms-details-chart-id";

  helpLinkPage = 'downtime-alarms-chart';
  helpPageLinkDestination = '#';
  indicator: any;

  constructor(
    private config: ConfigService,
    protected ref: NbDialogRef<DowntimeAlarmsDetailsChartComponent>,
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);
  }

  ngOnInit() {
    this.setHelpPage();
    this.showInfo = false;
  }

  openAlarmTimelineChart(chartData,alarmName) {
    const start = this.dateStart;
    const end = this.dateEnd;
    const obj = {
      chartData,
      alarmName,
      start,
      end,
    };
    const ref = this.dialogService.open(AlarmsTimelineChartComponent, {
      context: obj as Partial<AlarmsTimelineChartComponent>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {

    });
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  closeModal() {
    this.ref.close(true);
  }


  dataForChart() {
    if (this.isJustifyReason == true) {
      this.reasonName = this.chartData.reasonName
      this.data = this.chartData.alarms
    } else {
      this.machineName = this.chartData.machineOrComponentName;
      for(var i = 0; i < this.chartData.reasons.length; i++){

        if (this.chartData.reasons[i].reasonName == this.reasonName) {
          this.data = this.chartData.reasons[i].alarms
        }
      }
    }
    for(var k = 0; k < this.data.length; k++){
      const machine = this.data[k].machineName;
      const alarmName = this.data[k].name;
      const id = this.data[k].alarmId
      this.translate.get(["SHARED.id"]).subscribe((translations) => {
        this.data[k]["alarmDescription"] = machine + " - " + alarmName + " (" + translations["SHARED.id"] + ": " + id + ")"
      });
      if (this.maxTot < this.data[k].duration) {
        this.maxTot = this.data[k].duration;
      }
    }
    this.data.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);
  }

  drawChart() {
    const self = this;

    this.dataForChart()

    am4core.useTheme(am4themes_material);



    this.chart = am4core.create(self.chartId, am4charts.XYChart);
    this.chart.data = self.data;
    this.chart.paddingRight = 20;
    this.chart.paddingTop = 30;
    this.chart.paddingBottom = 30;
    this.chart.durationFormatter.durationFormat = "hh'h' mm'min' ss's'"

    if (this.canExportData) {
      this.chart.exporting.menu = new am4core.ExportMenu();
    }

    var categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "alarmDescription";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;
    categoryAxis.renderer.labels.template.fontSize = 12;
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
    this.series.dataFields.categoryY = "alarmDescription";
    this.series.dataFields.valueX = "duration";
    this.series.columns.template.strokeOpacity = 0;
    this.series.stacked = false;
    this.series.columns.template.tooltipText = "[bold]{valueX.value.formatDuration()}";
    this.series.columns.template.height = 20;

    this.series.columns.template.events.on(
      'hit',
      ev => {
        const alarmName = ev.target.dataItem.dataContext["alarmDescription"];
        const chartData = ev.target.dataItem.dataContext['occurrencesList'];
        if(chartData){
          self.openAlarmTimelineChart(chartData,alarmName);
        }
      },
    );
    //Series ready to appear
    this.series.events.on('ready', () => {
      this.showInfo = this.data?.length > 0 ? true : false;
    })

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
    let minChartHeight = 100;
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
      this.showInfo = false;
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

  }

  //Indicator no data available
  showIndicator() {
    this.noData = true;
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
    // Clean up chart when the component is removed
    if (this.chart) {
      this.chart.dispose();
    }
  }



}
