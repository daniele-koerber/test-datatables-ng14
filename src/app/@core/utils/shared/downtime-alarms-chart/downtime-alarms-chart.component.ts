import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { IntegrationData } from '../../../../@core/data/integration';
import { NbDialogService } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import {TranslateService} from '@ngx-translate/core';
import { SchedulingData } from '../../../data/scheduling';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_material from '@amcharts/amcharts4/themes/material';

import { Subscription } from 'rxjs';
import { AlarmsTimelineChartComponent } from '../alarm-timeline-chart/alarm-timeline-chart.component';
import { BaseClass } from '../../common/base-class/base-class';

@Component({
  selector: 'ngx-downtime-alarms-chart',
  styleUrls: ['./downtime-alarms-chart.component.scss'],
  templateUrl: './downtime-alarms-chart.component.html',
})

export class DowntimeAlarmsComponent extends BaseClass implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() chartId = 'downtimeAlarmsChart';
  @Input() dateStart;
  @Input() dateEnd;
  @Input() chartData: any = null;
  @Input() rowNumberToShow: number = 0;
  @Input() serverError: boolean = false;
  @Input() status;


  data = [];

  isLoading = false;

  showInfo = false;

  chart: am4charts.XYChart;
  categoryAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>;
  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;
  series: am4charts.ColumnSeries;
  indicator: any;

  maxTot = 0;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);
    am4core.options.queue = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.updateChartData();
    }
  }

  ngAfterViewInit(): void {
    this.drawChart();
    this.updateChartData();
  }

  updateChartData() {
    if (!this.chart || !this.chartData) { return false; }

    if (!this.data) {
      this.data = this.chartData;
    }
    //Load data
    this.chart.invalidateRawData();


    let fullDataUpdate = false;
    let slicedChartData = this.chartData.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);
    let slicedOldData = this.data.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);

    if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
      slicedChartData = slicedChartData.slice(this.chartData.length < this.rowNumberToShow ? 0 : this.chartData.length - this.rowNumberToShow, this.chartData.length);
      slicedOldData = slicedOldData.slice(this.data.length < this.rowNumberToShow ? 0 : this.data.length - this.rowNumberToShow, this.data.length);
    }

    if (slicedOldData.length > 0 && slicedChartData.length > 0) {
      if (slicedOldData.length == slicedChartData.length) {
        for (var i = 0; i < slicedChartData.length; i++) {
          if(slicedChartData[i].duration !== slicedOldData[i].duration || slicedChartData[i].occurrences !== slicedOldData[i].occurrences ||
            slicedChartData[i].name !== slicedOldData[i].name || slicedChartData[i].machinePath !== slicedOldData[i].machinePath ||
            slicedChartData[i].alarmId !== slicedOldData[i].alarmId){
          fullDataUpdate = true;
            break;
          }
        };
      }else {
        fullDataUpdate = true;
      }
    } else {
      fullDataUpdate = true;
    }

    if(fullDataUpdate === true) {

      this.data = this.chartData;

      this.data?.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);
      if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
        this.data = this.data?.slice(this.data.length < this.rowNumberToShow ? 0 : this.data.length - this.rowNumberToShow, this.data.length);
      }
      // Update chart data
      this.chart.data = this.data;
      // Update label data


      var actulaMaxTot = 0
      this.data?.forEach(data => {
        if (actulaMaxTot < data?.duration) {
          actulaMaxTot = data?.duration;
        }
      });

      if (this.maxTot !== actulaMaxTot) {
        this.maxTot = actulaMaxTot
        this.valueAxis.max = this.maxTot + (this.maxTot * 0.35);  // add 35% to maximum to leave space for label with total discarded
      }

      this.series.columns.template.fill = am4core.color(this.config.getColor(this.status));
      this.series.columns.template.stroke = am4core.color(this.config.getColor(this.status));

      if ((this.data?.length === 0)) {
        this.indicator?.show();
        this.showInfo = false;
      } else {
        if (this.indicator) {
          this.indicator?.hide();
        }
        this.showInfo = true;
      }
    }
  }

  ngOnInit() {
    this.isLoading = true;
    this.showInfo = false;
  }

  drawChart() {

    am4core.useTheme(am4themes_material);

    this.chart = am4core.create(this.chartId, am4charts.XYChart);

    this.chart.paddingRight = 20;
    this.chart.paddingTop = 10;
    this.chart.paddingBottom = 30;
    this.chart.durationFormatter.durationFormat = "hh'h' mm'min' ss's'"

    if (this.canExportData ) {
      this.chart.exporting.menu = new am4core.ExportMenu();
      this.chart.exporting.menu.align = 'left';
    }

    this.chart.chartContainer.paddingTop = 50;

    const labelButtonContainer = this.chart.plotContainer.createChild(am4core.Container);
    labelButtonContainer.shouldClone = false;
    labelButtonContainer.align = 'right';
    labelButtonContainer.valign = 'top';
    labelButtonContainer.zIndex = Number.MAX_SAFE_INTEGER;
    labelButtonContainer.marginTop = -60;
    labelButtonContainer.marginRight = 20;
    labelButtonContainer.layout = 'horizontal';

    const buttonContainer = this.chart.plotContainer.createChild(am4core.Container);
    buttonContainer.shouldClone = false;
    buttonContainer.align = 'right';
    buttonContainer.valign = 'top';
    buttonContainer.zIndex = Number.MAX_SAFE_INTEGER;
    buttonContainer.marginTop = -40;
    buttonContainer.marginRight = 5;
    buttonContainer.layout = 'horizontal';

    // Add switch button
    const chartSwitchButton = buttonContainer.createChild(am4core.SwitchButton);
    chartSwitchButton.marginTop = 0;
    chartSwitchButton.align = 'right';
    chartSwitchButton.valign = 'bottom';

    chartSwitchButton.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    this.translate.get(['REPORT.Duration']).subscribe((translations) => {
      chartSwitchButton.leftLabel.text = translations['REPORT.Duration'];
    });
    this.translate.get(['SHARED.Events']).subscribe((translations) => {
      chartSwitchButton.rightLabel.text = translations['SHARED.Events'];
    });
    chartSwitchButton.scale = 1;
    chartSwitchButton.fontSize = 12;

    chartSwitchButton.events.on('toggled', e => {

      if (chartSwitchButton.isActive) {
        let sortedData = this.chartData.sort((firstItem, secondItem) => firstItem.occurrences - secondItem.occurrences);

        if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
          sortedData = sortedData?.slice(sortedData.length - this.rowNumberToShow, sortedData.length);
        }
        this.chart.data = sortedData;
      } else {
        let sortedData = this.chartData.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);
        if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
          sortedData = sortedData?.slice(sortedData.length - this.rowNumberToShow, sortedData.length);
        }
        this.chart.data = sortedData;
      }
      });


    const switchLabel = labelButtonContainer.createChild(am4core.Label);
    this.translate.get(['SHARED.Alarm_sorting']).subscribe((translations) => {
      switchLabel.text = translations['SHARED.Alarm_sorting'];
    });
    switchLabel.align = 'center';
    switchLabel.valign = 'top';
    switchLabel.marginTop = 5;
    switchLabel.marginRight = 25;
    switchLabel.fontSize = 14;

    const categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'alarmDescription';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.cellEndLocation = 0.9;
    categoryAxis.renderer.grid.template.disabled = true;

    this.valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    this.valueAxis.min = 0;
    this.valueAxis.renderer.grid.template.disabled = true;
    this.valueAxis.renderer.labels.template.disabled = true;
    this.valueAxis.renderer.minGridDistance = 1;


    this.series = this.chart.series.push(new am4charts.ColumnSeries());
    this.series.dataFields.categoryY = 'alarmDescription';
    this.series.dataFields.valueX = 'duration';
    this.series.columns.template.strokeOpacity = 0;
    this.series.stacked = false;
    this.series.name = 'alarmDescription';
    this.translate.get(['SHARED.Events']).subscribe((translations) => {
      this.series.columns.template.tooltipText = '{valueX.value.formatDuration()}' + ' - ' + translations['SHARED.Events'] + ': ' + '{occurrences}';
    });
    this.series.columns.template.height = 20;
    this.series.columns.template.fill = am4core.color(this.config.getColor(this.status));
    this.series.columns.template.stroke = am4core.color(this.config.getColor(this.status));

    // Create action on hit to open alarms details modal
    this.series.columns.template.events.on( 'hit', ev => {
        const alarmName = ev.target.dataItem.dataContext['alarmDescription'];
        const chartData = ev.target.dataItem.dataContext['occurrencesList'];
        if (chartData) {
          this.openAlarmTimelineChart(chartData, alarmName);
        }
      },
    );

    // Series ready to appear
    this.series.events.on('ready', () => {
      this.isLoading = false;
      this.showInfo = this.data?.length > 0 ? true : false;
    });

    // Label
    const labelBullet = this.series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.horizontalCenter = 'left';
    labelBullet.label.dx = 10;
    this.translate.get(['SHARED.Events']).subscribe((translations) => {
      labelBullet.label.text = '{duration.formatDuration()}' + ' - ' + translations['SHARED.Events'] + ': ' + '{occurrences}';
    });


    // labelBullet.locationX = 1;
    labelBullet.label.hideOversized = false;
    labelBullet.label.truncate = false;
    labelBullet.label.fontSize = 12;


    // Auto-adjusting chart height based on a number of data items
    const cellSize = 40; // Set cell size in pixels
    const minChartHeight = 110;
    this.chart.events.on('datavalidated', function(ev) {

      // Get objects of interest
      const chart = ev.target;
      const categoryAxis = chart.yAxes.getIndex(0);

      // Calculate how we need to adjust chart height
      const adjustHeight = chart.data.length * cellSize;

      // get current chart height
      const targetHeight = minChartHeight + adjustHeight;

      // Set it on chart's container
      chart.svgContainer.htmlElement.style.height = targetHeight + 'px';
    });

    this.showIndicator();

    if ((!this.data) || (this.data.length === 0)) {
      this.indicator.show();
      this.showInfo = false;
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

  }

  // Indicator no data available
  showIndicator() {
    this.indicator = this.chart.tooltipContainer.createChild(am4core.Container);
    this.indicator.background.fill = am4core.color('#fff');
    this.indicator.background.fillOpacity = 1.0;
    this.indicator.width = am4core.percent(100);
    this.indicator.height = am4core.percent(100);

    const indicatorLabel = this.indicator.createChild(am4core.Label);


    if (this.serverError === true) {
      this.translate.get(['SHARED.Server_Error_While_Data_Loading']).subscribe((translations) => {
        indicatorLabel.text = translations['SHARED.Server_Error_While_Data_Loading'];
      });
    } else {
      this.translate.get(['SHARED.No_Data_Available']).subscribe((translations) => {
        indicatorLabel.text = translations['SHARED.No_Data_Available'];
      });
    }
    indicatorLabel.align = 'center';
    indicatorLabel.valign = 'middle';
    indicatorLabel.fontSize = 20;
  }

  openAlarmTimelineChart(chartData, alarmName) {
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

  ngOnDestroy(): void {
    // Clean up chart when the component is removed
      if (this.chart) {
        this.chart.dispose();
      }
    }

}
