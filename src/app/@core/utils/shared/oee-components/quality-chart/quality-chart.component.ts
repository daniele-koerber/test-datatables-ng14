import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';


import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";

import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { BaseClass } from '../../../common/base-class/base-class';
import { OEE } from '../../../models/presentation/integration/oee';
import { ConfigService } from '../../../services/config.service';

import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';


@Component({
  selector: 'ngx-quality-chart',
  styleUrls: ['./quality-chart.component.scss'],
  templateUrl: './quality-chart.component.html',
})

export class QualityChartComponent extends BaseClass implements OnChanges {

  @Input() componentData: OEE = {};
  @Input() chartId: string;

  qualityKeyArray = [];
  data: any = [];

  indicator: any;
  root: am5.Root;
  chart: am5percent.PieChart;
  labelPerc: am5.Label;
  series: am5percent.PieSeries;
  chartColors: am5.Color[];
  labelTot: am5.Label;
  indicatorLabel: am5.Label;
  legend: am5.Legend;
  exporting: am5exporting.Exporting;
  resize = null;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);

    this.chartColors = [
      am5.color(this.config.getColor('success')),
      am5.color(this.config.getColor('grey_3')),
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


  ngAfterViewInit(): void {
    am5.ready(() => {
      setTimeout(() => {
        this.drawChart();
        this.updateChartData();
      }, 100);
    });
  }


  ngOnChanges(changes: SimpleChanges) {
    if (this.componentData) {
      if(this.root && this.chart){
        this.updateChartData();
      }
    }
  }

  updateChartData() {
    if(!this.chart || !this.componentData) { return false }

    this.qualityKeyArray = [
      { key: 'Good_Pieces'},
      { key: 'Defective'},
    ];
    this.translate.get([...this.qualityKeyArray.map(el => 'COMMON.' + el.key)]).subscribe((translations) => {
      for (const [index, [key, value]] of Object.entries(Object.entries(translations))) {
        this.qualityKeyArray[index].key = value;
      }
    });

    var defective = this.componentData.totalPieces - this.componentData.goodPieces;
    if (defective < 0) {defective = 0; }

    if (this.componentData.uoM && !this.serverError) {
      this.data = [{
        "sector": this.qualityKeyArray[0].key,
        "size": this.componentData.goodPieces,
      }, {
        "sector": this.qualityKeyArray[1].key,
        "size": defective,
      }];
    }

    const roundedOEE = Math.round(this.componentData.qualityPercentageRounded * 10) / 10
    this.labelPerc?.set("text", roundedOEE ? roundedOEE + '%' : '0.0 %');

    this.translate.get(["COMMON.Total_pieces"]).subscribe((translations) => {
      this.labelTot?.set("text", translations["COMMON.Total_pieces"] + " : " + "[bold]" + (Math.round(this.componentData.totalPieces * 10.0) / 10.0) + "[/] " + this.componentData.uoM);
    });

    //Update tooltip
    if (this.series) {
      this.series.slices.template.set('tooltipText', "[fontSize:11px;]{category}: [fontSize:11px;bold]{valuePercentTotal.formatNumber('0.00p')} [/][fontSize:11px;]({value.formatNumber('#.0')} "  + this.componentData.uoM + ")");
      this.series.set('legendValueText',"[bold]{valuePercentTotal.formatNumber('0.00p')}[/] ({value.formatNumber('#.0')} " + this.componentData.uoM + ")")
    }

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    this.series.data.setAll(this.data);
    this.legend.data.setAll(this.series.dataItems);

    //Data Export
    if (this.canExportData) {
      this.exporting = am5exporting.Exporting.new(this.root, {
        menu: am5exporting.ExportingMenu.new(this.root, {
          align: "right",
        }),
        dataSource: this.data,
      });
    }

    this.updateLabelIndicatorText();
    if ((this.data?.length == 0) || !this.componentData.uoM || this.noData || this.isLoading || this.serverError) {
      this.indicator?.show()
    } else {
      if (this.indicator) {
        this.indicator?.hide()
      }
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
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    this.chart = this.root.container.children.push(am5percent.PieChart.new(this.root, {
      layout: this.root.verticalLayout
    }));

    this.labelTot = this.chart.children.unshift(am5.Label.new(this.root, {
      fontSize: 14,
      textAlign: "left",
      x: am5.percent(50),
      centerX: am5.percent(50),
      paddingTop: 0,
      paddingBottom: 0,
      oversizedBehavior: "truncate",
      width: am5.p100
    }));

    this.labelTot.adapters.add("maxWidth", () => {
      return this.chart.width();
    })

    this.labelTot.adapters.add("x", (x, target) => {
      target.set("maxWidth", this.chart.width());
      return x;
    })

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    this.series = this.chart.series.push(am5percent.PieSeries.new(this.root, {
      valueField: "size",
      categoryField: "sector",
      innerRadius: am5.percent(75),
      legendLabelText: "{category}",
      legendValueText: "[bold]{valuePercentTotal.formatNumber('0.00p')}[/] ({value.formatNumber('#.0')} " + this.componentData?.uoM + ")"
    }));

    this.series.get("colors").set("colors", this.chartColors);

    this.series.labels.template.set("forceHidden", true);
    this.series.ticks.template.set("forceHidden", true);


    // Create legend
    // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
    this.legend = this.chart.children.push(am5.Legend.new(this.root, {
      layout: this.root.verticalLayout,
      width: am5.percent(100)
    }));
    this.legend.itemContainers.template.set("width", am5.p100);

    // set width and max width of labels
    this.legend.labels.template.setAll({
      oversizedBehavior: "truncate",
      width: am5.p100
    });

    this.legend.labels.template.adapters.add("maxWidth", () => {
      return this.chart.width() - 190;
    })

    this.legend.labels.template.adapters.add("x", (x, target) => {
      target.set("maxWidth", this.chart.width() - 190);
      return x;
    })

    this.legend.labels.template.set('fontSize', 12)
    this.legend.valueLabels.template.set('fontSize',12)

    this.legend.markerRectangles.template.setAll({
      width: 13,
      height: 13,
      y: am5.percent(15)
    });

    this.labelPerc = this.series.children.unshift(am5.Label.new(this.root, {
      fontSize: 25,
      textAlign: "center",
      x: am5.percent(0),
      centerX: am5.percent(50),
      y: am5.percent(0),
      centerY: am5.percent(50),
      paddingTop: 0,
      paddingBottom: 0
    }));

    //Data Export
    if (this.canExportData) {
      this.exporting = am5exporting.Exporting.new(this.root, {
        menu: am5exporting.ExportingMenu.new(this.root, {
          align: "right",
        }),
        dataSource: this.data,
      });
    }

    this.series.appear(1000, 100);

    this.showIndicator();
    this.updateLabelIndicatorText();
    if ((this.data?.length == 0) || !this.componentData?.uoM || this.noData || this.isLoading || this.serverError) {
      this.indicator?.show()
    } else {
      if (this.indicator) {
        this.indicator?.hide()
      }
    }

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
