import { BaseClass } from './../../common/base-class/base-class';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { IntegrationData } from '../../../../@core/data/integration';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import {TranslateService} from '@ngx-translate/core';
import { SchedulingData } from '../../../data/scheduling';


import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { MachineStatusInMinutes } from '../../models/presentation/integration/machine-status-in-minutes';

@Component({
  selector: 'ngx-machine-status-report-chart',
  styleUrls: ['./machine-status-report-chart.component.scss'],
  templateUrl: './machine-status-report-chart.component.html',
})

export class MachineStatusReportChartComponent extends BaseClass implements OnInit, OnDestroy, OnChanges{


  @Input() chartId;
  @Input() isDetails = false;
  @Input() machineStatus: MachineStatusInMinutes;
  @Input() showMachineInUse = true

  selectedProcessCell: any;
  chartData = [];
  statusData = [];
  statusValue = [];
  statusName = [];
  machineStatesArray = [];

  chart: am5radar.RadarChart;
  categoryAxis;
  valueAxis;
  indicator;
  root: am5.Root;
  series: am5radar.RadarColumnSeries;
  lastLabelText: any;
  legend: am5.Legend;
  indicatorLabel: any;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
  }

  ngOnInit(): void {
    am5.ready(() => {
      setTimeout(() => {
        if (!this.chart && this.machineStatus !== undefined && this.machineStatus !== null) {
          this.drawChart();
        }
      }, 200);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      // this.root.dispose();
      // this.drawChart();
      this.chart.series.clear();
      this.legend.data.clear();
      this.updateChartData();
    }else {
      am5.ready(() => {
        setTimeout(() => {
          if (!this.chart) {
            this.drawChart();
          }
        }, 200);
      });
    }
    // if (changes.data) {
    //   this.updateChartData();
    // }
  }


  getChartData() {
    this.statusValue = [];
    this.statusName = [];
    this.chartData = [];

    if(this.machineStatus !== undefined && this.machineStatus !== null){
      (this.machineStatus.statusPerMinutes as any)?.map((mac) => {
      if (mac.isInUse == true || this.showMachineInUse == false) {
        mac.statuses.map(status => {

          if (!this.statusValue.includes(status.statusValue)) {
            this.statusValue.push(status.statusValue);
            this.statusName.push(status.statusName);

          }
        });
        const obj = {
          machine: mac.machineOrComponentName,
          shortName: mac.machineOrComponentPath.substr(mac.machineOrComponentPath.lastIndexOf(".") + 1),
          path: mac.machineOrComponentPath,
        };

        mac.statuses.map((status) => {
          obj[status.statusName] = Math.floor(status.durationSeconds);
        });
        this.chartData.push(obj);
      }
    });
    }
  }


  drawChart() {

    this.getChartData();

    this.root = am5.Root.new(this.chartId);

    // Set themes
    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    // Create chart
    this.chart = this.root.container.children.push(
      am5radar.RadarChart.new(this.root, {
        innerRadius: am5.percent(60),
        layout: this.root.verticalLayout,
        marginTop: 0,
        paddingTop: 0,
        paddingLeft: 50,
        startAngle: 215,
        endAngle: 325,
      })
    );

    // Create axes and their renderers
    var xRenderer = am5radar.AxisRendererCircular.new(this.root, { minGridDistance: 0 });
    xRenderer.labels.template.setAll({ textType: 'adjusted' });

    var colCount = 0
    const numOfCol = this.chartData.length
    const startColAdapt = (numOfCol / 2) - ((numOfCol / 3) / 2)
    const endColAdapt = (numOfCol / 2) + ((numOfCol / 3) / 2)
    // if (this.isDetails && numOfCol > 20) {
    //   xRenderer.labels.template.adapters.add("dy", function(dy, target) {
    //     ++colCount
    //     let dyOffset = 0
    //     if (colCount >= startColAdapt && colCount <= endColAdapt  ) {
    //       if (target.dataItem && target.dataItem.uid % 2 == 0) {
    //         dyOffset = 25;
    //       } else {
    //         dyOffset = 0;
    //       }
    //     } else {
    //       dyOffset = 0
    //     }
    //     return dy - dyOffset;
    //   });

    // }

    this.categoryAxis = this.chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        maxDeviation: 0,
        categoryField: this.isDetails ? 'machine' : 'shortName',
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(this.root, {})
      }),
    );

    this.categoryAxis.get('renderer').labels.template.setAll({
      location: 0.5,
      fontSize: 8,
      textAlign: "center",
      oversizedBehavior: "wrap",
      maxWidth: 50,
    }),
    this.categoryAxis.get('renderer').grid.template.set('strokeOpacity', 0.1);
    this.categoryAxis.get('renderer').axisFills.template.set('disabled', true);
    this.root.durationFormatter.set("baseUnit", "second");
    this.root.durationFormatter.set("durationFormat", "h'h' m'min'");

    this.valueAxis = this.chart.yAxes.push(
      am5xy.DurationAxis.new(this.root, {
        min: 0,
        baseUnit: "second",
        renderer: am5radar.AxisRendererRadial.new(this.root, {
          axisAngle: this.chart.get('startAngle'),
        }),
      }),
    );
    this.translate.get(['SHARED.min']).subscribe((translations) => {
      this.valueAxis.get('renderer').labels.template.adapters.add('text', (text, target): string => {
        if (text !== undefined){
          this.lastLabelText = text;
          const timeArray = text?.split(' ');
          const hourValue = timeArray[0].split('h')[0];
          const minuteValue = timeArray[1].split('min')[0];
          if (hourValue === '0') {
            return timeArray[1];
          } else if (hourValue !== '0' && minuteValue === '0') {
            return timeArray[0];
          } else {
            return text;
          }
        } else {
          return text;
        }
      });
    });

    this.valueAxis.get('renderer').labels.template.setAll({
      centerX: am5.p100,
      fontSize: 12,
    });
    this.valueAxis.get('renderer').grid.template.set('strokeOpacity', 0.05);
    this.valueAxis.get('renderer').axisFills.template.set('disabled', true);

    // Create series
    for (let el = 0; el < this.statusValue.length; el++) {
      this.createSeries(this.statusName[el], this.statusValue[el])
    }


    const startAngle = 215;
    const endAngle = 325;
    this.chart.gridContainer.toFront();
    this.chart.setAll({ startAngle: startAngle, endAngle: endAngle });
    this.valueAxis.get('renderer').set('axisAngle', startAngle);


    this.legend = this.chart.children.push(am5.Legend.new(this.root, {
      x: am5.p50,
      centerX: am5.p50,
    }));
    this.legend.labels.template.setAll({
      marginRight: -50,
    });

    if (this.isDetails === true) {
      this.legend.labels.template.set('fontSize', 14);
      this.legend.markers.template.setAll({
        width: 20,
        height: 20,
      });
    } else {
      this.legend.labels.template.set('fontSize', 12);
      this.legend.markers.template.setAll({
        width: 13,
        height: 13,
      });
    }

    if (this.canExportData) {
      const exporting = am5plugins_exporting.Exporting.new(this.root, {
          menu: am5plugins_exporting.ExportingMenu.new(this.root, {}),
          dataSource: this.chartData,
      });
    }

    this.showIndicator();

    if (this.chartData.length == 0 || this.noData || this.serverError) {
      this.indicator.show()
    } else {
      if (this.indicator) {
        this.indicator.hide()
      }
    }


    this.legend.data.setAll(this.chart.series.values);

    this.categoryAxis.data.setAll(this.chartData);
    this.chart.appear(1000, 100);
    this.isLoading = false;
    this.loadingFinished.emit(true);
  }

  createSeries(statusName,statusValue) {

    this.series = this.chart.series.push(
      am5radar.RadarColumnSeries.new(this.root, {
        stacked: true,
        name: statusName,
        xAxis: this.categoryAxis,
        yAxis: this.valueAxis,
        valueYField: statusName,
        categoryXField: this.isDetails? 'machine' : 'shortName',
        fill: am5.color(this.getMachineStatusColor(statusValue)),
        stroke: am5.color(this.getMachineStatusColor(statusValue)),
      }),
    );

    this.translate.get(['SHARED.min']).subscribe((translations) => {
      this.series.columns.template.setAll({
        tooltipText: '{machine} ({name}): [bold] ',
      });
    });

    this.series.columns.template.adapters.add('tooltipText', (text, target) => {
      const newText = this.secondsToHms((target.dataItem._settings as any).valueY);
      return text  + newText;
    });
    this.series.data.setAll(this.chartData);
    this.series.appear(1000);

  }

  getMachineStatusColor(val) {
    return this.config.getMachineStatusColorFromStatusValue(val);
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
    this.indicatorLabel = this.indicator.children.push(am5.Label.new(this.root, {
      fontSize: 20,
      x: am5.p50,
      y: am5.p50,
      centerX: am5.p50,
      centerY: am5.p50
    }));
    this.updateLabelIndicatorText();
  }

  updateLabelIndicatorText() {
    if (this.serverError === true) {
      this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
        const text = translations["SHARED.Server_Error_While_Data_Loading"];
        this.indicatorLabel.set("text", text)
      });
    } else if ((this.noData || this.chartData.length == 0) && !this.isLoading  && (this.isLoading !== undefined))  {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        const text = translations["SHARED.No_Data_Available"];
        this.indicatorLabel.set("text", text)
      });
    } else {
      const text = "";
      this.indicatorLabel.set("text", text)
    }
  }

  updateChartData() {
    this.getChartData();
    this.updateLabelIndicatorText()
    if (this.chartData.length == 0 || this.noData || this.serverError) {
      this.indicator.show()
    } else {
      if (this.indicator) {
        this.indicator.hide()
      }
    }
    this.chart.series.dispose()
    // Create series
    for (let el = 0; el < this.statusValue.length; el++) {
      this.createSeries(this.statusName[el], this.statusValue[el])
    }
    this.legend.data.setAll(this.chart.series.values);
    this.categoryAxis.data.setAll(this.chartData);

  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }
}
