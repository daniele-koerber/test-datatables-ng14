import { Component, OnInit, ViewChild, Output, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { ChartComponent } from 'angular2-chartjs';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";

import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";

import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../../data/configuration';
import { IntegrationData } from '../../../../data/integration';
import { SchedulingData } from '../../../../data/scheduling';
import { BaseClass } from '../../../common/base-class/base-class';
import { OEE } from '../../../models/presentation/integration/oee';
import { ConfigService } from '../../../services';

import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';


@Component({
  selector: 'ngx-availability-chart',
  styleUrls: ['./availability-chart.component.scss'],
  templateUrl: './availability-chart.component.html',
})

export class AvailabilityChartComponent extends BaseClass implements OnChanges, AfterViewInit {

  @Input() componentData: OEE = {};
  @Input() chartId: string;

  availabilityKeyArray = [];

  data: any = [];


  d: string
  h: string;
  min: string;
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
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private translate: TranslateService,
    private scheduleService: SchedulingData,
    private nbAuthService: NbAuthService,

  ) {
    super(nbAuthService);

    this.chartColors = [
      am5.color(this.config.getColor('accent_4')),
      am5.color(this.config.getColor('grey_3')),
    ];

    this.translate.get(["COMMON.d","COMMON.h","COMMON.min"]).subscribe((translations) => {
      this.d = translations["COMMON.d"];
      this.h = translations["COMMON.h"];
      this.min = translations["COMMON.min"];
    });

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
    if(!this.chart || !this.componentData) { return false }

    this.availabilityKeyArray = [
      { key: 'Operating_time'},
      { key: this.machinePath? 'Not_Operating_time':'Down_time'},
    ];
    this.translate.get([...this.availabilityKeyArray.map(el => 'COMMON.' + el.key)]).subscribe((translations) => {
      for (const [index, [key, value]] of Object.entries(Object.entries(translations))) {
        this.availabilityKeyArray[index].key = value;
      }
    });

    if (this.componentData.uoM && !this.serverError) {
      
      this.data = [{
        "sector": this.availabilityKeyArray[0].key,
        "size": this.componentData.operatingTime,
        "timeStringFormat": this.secondsToDuration(this.componentData.operatingTime, this.d, this.h, this.min),
      }, {
        "sector": this.availabilityKeyArray[1].key,
        "size": this.componentData.plannedProductionTime -  this.componentData.operatingTime,
        "timeStringFormat": this.secondsToDuration(this.componentData.plannedProductionTime -  this.componentData.operatingTime, this.d, this.h, this.min),
      }];
    }

    const roundedOEE = Math.round(this.componentData.availabilityPercentageRounded * 10) / 10
    this.labelPerc?.set("text", roundedOEE ? roundedOEE + '%' : '0.0 %');
    const totTime = this.componentData.plannedProductionTime;
    const timeFormTot = (this.componentData.plannedProductionTime === 0 ? 0 : this.secondsToDuration(totTime, this.d, this.h, this.min));
    this.translate.get(["COMMON.Production_time"]).subscribe((translations) => {
      this.labelTot?.set("text", translations["COMMON.Production_time"] + " : " + "[bold]" + timeFormTot);
    });

    if (this.series) {
      this.series.slices.template.set('tooltipText', "[fontSize:12px;]{category}: [fontSize:12px;bold]{valuePercentTotal.formatNumber('0.00p')} [/][fontSize:12px;]" +
      (true ? " ({timeStringFormat})" : ""));
    }
    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    this.series.data.setAll(this.data);
    this.legend.data.setAll(this.series.dataItems);

    if (this.canExportData) {
      this.exporting = am5exporting.Exporting.new(this.root, {
        menu: am5exporting.ExportingMenu.new(this.root, {
          align: "right",
        }),
        dataSource: this.data,
      });
    //   this.exporting.get("menu").set("items", [
        // {
        //   type: "custom",
        //   label: "Export",
        //   callback: function() {}
        // }, {
        //   type: "separator"
        // },
    //     {
    //       type: "format",
    //       format: "csv",
    //       label: "CSV file"
    //     }, {
    //       type: "format",
    //       format: "jpg",
    //       label: "JPG image"
    //     },
    //     {
    //       type: "format",
    //       format: "xlsx",
    //       label: "XLSX file"
    //     }, {
    //       type: "format",
    //       format: "pdf",
    //       label: "PDF image"
    //     },
    //     , {
    //       type: "format",
    //       format: "json",
    //       label: "JSON file"
    //     }, {
    //       type: "separator"
    //     }, {
    //       type: "format",
    //       format: "print",
    //       label: "Print"
    //     }
    // ]);
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
      legendValueText: "[bold]{valuePercentTotal.formatNumber('0.00p')}[/]" +
      (true ? " ({timeStringFormat})" : "")
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
      return this.chart.width() - 180;
    })

    this.legend.labels.template.adapters.add("x", (x, target) => {
      target.set("maxWidth", this.chart.width() - 180);
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
    if ((this.data?.length == 0) || !this.componentData.uoM || this.noData || this.isLoading || this.serverError) {
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


  minutesToHm(d) {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);

      var hDisplay = h > 0 ? h + "h " : "";
      var mDisplay = m > 0 ? m + "min" : "";
      return hDisplay + mDisplay;
  }

  timeConvert(seconds) {
    const num = seconds / 60;
    const hours = num / 60;
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);
    return (rhours !== 0 ? `${rhours}h` : '') + ` ${rminutes}min`;
  }

  stringToSec(t) {
    //String format: hh:mm.ss
    return Number(t.split(':')[2]) + Number(t.split(':')[1])*60+Number(t.split(':')[0]*3600);
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
