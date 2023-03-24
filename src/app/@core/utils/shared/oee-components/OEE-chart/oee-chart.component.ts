import { Component, OnInit, Input, SimpleChanges, OnChanges, AfterViewInit, } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';


import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5radar from "@amcharts/amcharts5/radar";

import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { BaseClass } from '../../../common/base-class/base-class';
import { OEE } from '../../../models/presentation/integration/oee';
import { ConfigService } from '../../../services';

import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';


@Component({
  selector: 'ngx-oee-chart',
  styleUrls: ['./oee-chart.component.scss'],
  templateUrl: './oee-chart.component.html',
})

export class OEEChartComponent extends BaseClass implements OnChanges, AfterViewInit {
  @Input() componentData: OEE = {};
  @Input() chartId: string;

  OEEKeyArray = [];
  data: any = [];
  chartColors: any[];

  chart: any;
  labelOEEPerc: any;
  categoryAxis: any;
  valueAxis: any;
  indicator: any;
  indicatorLabel: any
  root: any;
  yAxis: any;
  xAxis: any;
  grayBackgroundSeries: any;
  percentageSeries: any;
  exporting: am5exporting.Exporting;
  resize = null;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private nbAuthService: NbAuthService,

  ) {

    super(nbAuthService);

    this.chartColors = [
      am5.color(this.config.getColor('accent_4')),
      am5.color(this.config.getColor('primary')),
      am5.color(this.config.getColor('success')),
    ];

    this.resize = fromEvent(window, 'resize');
    this.resize
      .pipe(
        map((i: any) => i),
        debounceTime(1) // He waits > 0.5s between 2 events emitted before running the next.
      )
      .subscribe((event) => {
        this.root.resize();
      });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.componentData) {
      if(this.root && this.chart){
        this.updateChartData();
      }
    }
  }

  ngAfterViewInit(): void {
    am5.ready(() => {
      setTimeout(() => {
        this.drawChart();
        this.updateChartData();
      }, 100);
    });
  }

  updateChartData() {

    this.OEEKeyArray = [
      { key: 'Availability'},
      { key: 'Performance'},
      { key: 'Quality'},
    ];
    this.translate.get([...this.OEEKeyArray.map(el => 'OVERVIEW.' + el.key)]).subscribe((translations) => {
      for (const [index, [key, value]] of Object.entries(Object.entries(translations))) {
        this.OEEKeyArray[index].key = value;
      }
    });

    if (this.componentData?.uoM && !this.serverError) {
      this.data = [{
        category: this.OEEKeyArray[2].key,
        value: this.componentData?.qualityPercentageRounded,
        full: 100,
        columnSettings: { fill: this.chartColors[2]}

      }, {
        category: this.OEEKeyArray[1].key,
        value: this.componentData?.performancePercentageRounded,
        full: 100,
        columnSettings: { fill: this.chartColors[1]}
      }, {
        category: this.OEEKeyArray[0].key,
        value: this.componentData?.availabilityPercentageRounded,
        full: 100,
        columnSettings: { fill: this.chartColors[0]}
      } ];
    }



    const roundedOEE = Math.round(this.componentData?.OEEPercentageRounded * 10) / 10
    this.labelOEEPerc?.set("text", roundedOEE ? roundedOEE + '%' : '0.0 %');

    this.updateLabelIndicatorText();
    if ((this.data?.length == 0) || !this.componentData?.uoM || this.noData || this.isLoading || this.serverError) {
      this.indicator?.show()
    } else {
      if (this.indicator) {
        this.indicator?.hide()
      }
    }

    //Update chart data
    this.yAxis.data.setAll(this.data);
    this.grayBackgroundSeries.data.setAll(this.data);
    this.percentageSeries.data.setAll(this.data);

    //Data Export
    if (this.canExportData) {
      this.exporting = am5exporting.Exporting.new(this.root, {
        menu: am5exporting.ExportingMenu.new(this.root, {
          align: "right",
        }),
        dataSource: this.data,
      });
    }

  }


  drawChart() {

  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  this.root = am5.Root.new(this.chartId);
  this.root.autoResize = false;
  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  this.root.setThemes([
    am5themes_Animated.new(this.root)
  ]);

  // Create chart
  // https://www.amcharts.com/docs/v5/charts/radar-chart/
  this.chart = this.root.container.children.push(am5radar.RadarChart.new(this.root, {
    panX: false,
    panY: false,
    innerRadius: am5.percent(50),
    startAngle: -90,
    endAngle: 180,
  }));
  this.root.container.set('paddingLeft',10)
  this.root.container.set('paddingRight',10)

  this.chart.get("colors").set("colors", this.chartColors);

  // Create axes and their renderers
  // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_axes
  var xRenderer = am5radar.AxisRendererCircular.new(this.root, {
    minGridDistance: 40
  });

  xRenderer.labels.template.setAll({
    radius: 10,
    fontSize: 12,
  });

  xRenderer.grid.template.setAll({
    forceHidden: true
  });

  this.xAxis = this.chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
    renderer: xRenderer,
    min: 0,
    max: 100,
    strictMinMax: true,
    numberFormat: "#'%'",
  }));


  var yRenderer = am5radar.AxisRendererRadial.new(this.root, {
    minGridDistance: 0
  });

  var yRenderer = am5radar.AxisRendererRadial.new(this.root, {
    minGridDistance: 0
  });

  yRenderer.labels.template.setAll({
    centerX: am5.p100,
    fontWeight: "500",
    fontSize: 12,
    templateField: "columnSettings"
  });

  yRenderer.grid.template.setAll({
    forceHidden: true
  });

  this.yAxis = this.chart.yAxes.push(am5xy.CategoryAxis.new(this.root, {
    categoryField: "category",
    renderer: yRenderer
  }));

  // Create series
  // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_series
  this.grayBackgroundSeries = this.chart.series.push(am5radar.RadarColumnSeries.new(this.root, {
    xAxis: this.xAxis,
    yAxis: this.yAxis,
    clustered: false,
    valueXField: "full",
    categoryYField: "category",
    fill: this.root.interfaceColors.get("alternativeBackground")
  }));

  this.grayBackgroundSeries.columns.template.setAll({
    width: am5.p100,
    fillOpacity: 0.08,
    strokeOpacity: 0,
    cornerRadius: 20
  });

  this.percentageSeries = this.chart.series.push(am5radar.RadarColumnSeries.new(this.root, {
    xAxis: this.xAxis,
    yAxis: this.yAxis,
    clustered: false,
    valueXField: "value",
    categoryYField: "category"
  }));

  this.percentageSeries.columns.template.setAll({
    width: am5.p100,
    strokeOpacity: 0,
    tooltipText: "[fontSize:12px;]{category}: [fontSize:12px;bold]{valueX}%",
    cornerRadius: 20,
    templateField: "columnSettings"
  });

  //Data Export
  if (this.canExportData) {
    this.exporting = am5exporting.Exporting.new(this.root, {
      menu: am5exporting.ExportingMenu.new(this.root, {
        align: "right",
      }),
      dataSource: this.data,
    });
  }

  // Animate chart and series in
  // https://www.amcharts.com/docs/v5/concepts/animations/#Initial_animation
  this.grayBackgroundSeries.appear(1000);
  this.percentageSeries.appear(1000);
  this.chart.appear(1000, 100);


    // const roundedOEE = Math.round(this.componentData.OEEPercentageRounded * 10) / 10;

    this.labelOEEPerc = this.chart.children.unshift(am5.Label.new(this.root, {
      //text: roundedOEE ? roundedOEE + '%' : '0.0 %',
      fontSize: 25,
      fontWeight: "500",
      textAlign: "center",
      x: 30,
      y: 0,
      paddingTop: 0,
      paddingBottom: 0
    }));


    this.showIndicator();
    if ((this.data?.length == 0) || this.noData || this.isLoading || this.serverError)  {
      this.indicator?.show()
    } else {
      if (this.indicator) {
        this.indicator?.hide()
      }
    }
    this.updateLabelIndicatorText();
  }



  //Show no data available in case of null data
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
      fontSize: 12,
      x: am5.p50,
      y: am5.p50,
      centerX: am5.p50,
      centerY: am5.p50,
    }));
  }

  updateLabelIndicatorText() {
    if (this.serverError === true) {
      this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
        const text = translations["SHARED.Server_Error_While_Data_Loading"];
        this.indicatorLabel.set("text", text)
      });
    } else if ((this.noData || (!this.data) || (this.data?.length === 0))  && !this.isLoading  && (this.isLoading !== undefined)) {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        const text = translations["SHARED.No_Data_Available"];
        this.indicatorLabel.set("text", text)
      });
    } else {
      const text = "";
      this.indicatorLabel.set("text", text)
    }
  }


  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    if(this.resize) {
      // this.resize.unsubscribe();
    }
  }


}
