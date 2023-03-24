import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5xy from "@amcharts/amcharts5/xy";
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../services';
import { BaseClass } from '../../common/base-class/base-class';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-line-speed-chart',
  templateUrl: './line-speed-chart.component.html',
  styleUrls: ['./line-speed-chart.component.scss']
})
export class LineSpeedChartComponent extends BaseClass implements  AfterViewInit, OnChanges, OnDestroy{

  @Input() chartId= 'linechartId' + this.generateId(20);

  @Input() minBetweenTwoPoint;
  @Input() chartData;
  @Input() chartColor;
  @Input() chartUoM;
  @Input() canExportData: boolean = false;
  @Input() serverError: boolean = false;
  @Input() isLoading: boolean = true;
  @Input() showActualValue: boolean = false;


  lang: string;
  rootLiveData: am5.Root;
  xAxis: any;
  yAxis: any;
  series: any;
  indicator: any;
  indicatorLabel: any;
  chart: any;
  firstDraw: boolean = true;
  actualValue: number;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private nbAuthService: NbAuthService
    ) {
      super(nbAuthService);
      const lang = config.getSelectedLanguage();
      translate.use(lang)
      this.lang = lang;
    }

    ngOnChanges(changes: SimpleChanges): void {
      if(changes?.chartData) {
        this.chartData.values.sort((firstItem, secondItem) => firstItem.time - secondItem.time);
        this.getActualValue(this.chartData);
      }

      am5.ready(() => {
        if(this.rootLiveData === undefined  && this.chartData !== undefined && !this.firstDraw && this.chartData?.values?.length > 0){
          setTimeout(() => {
             //Get actual value
            this.getActualValue(this.chartData);

              this.drawLiveDataChart();
          }, 100);
        } else{
          if(changes?.chartData?.currentValue?.values) {
            //Get actual value
          //  this.getActualValue(this.chartData);
            if(this.series){
              this.series?.data?.setAll(this.chartData.values);
              this.updateLabelIndicatorText();
              if (this.chartData.values.length == 0) {
                this.indicator.show();
              } else {
                if (this.indicator) {
                  this.indicator.hide();
                }
              }
            }
          }
        }
      });
    }

    getActualValue(values) {
      if (values) {
        if((values.values?.length - 1) > 0){
          for (var item = values.values?.length-1; item >= 0; item--) {
            if (values.values[item]?.informationValue || values.values[item]?.informationValue == 0) {
              this.actualValue = this.trim(values.values[item].informationValue, 2) 
              break;
            }
          }
        }
      }
    }
  

  ngAfterViewInit(): void {
    am5.ready(() => {
      if(this.rootLiveData === undefined  && this.chartData !== undefined && this.chartData?.values?.length > 0){
        setTimeout(() => {
          this.firstDraw = false;
          this.drawLiveDataChart();
        }, 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.rootLiveData) {
      this.chart.dispose();
      this.rootLiveData.dispose();
    }
  }

  drawLiveDataChart() {
    if(this.rootLiveData) return;
    this.isLoading = true;

    this.rootLiveData = am5.Root.new(this.chartId);

    this.rootLiveData.durationFormatter.set('durationFormat', "dd'd' hh'h' mm'min'");
    this.rootLiveData.numberFormatter.set('numberFormat', '#.##');

    this.rootLiveData.dateFormatter.set("intlLocales", this.lang);
    this.rootLiveData.numberFormatter.set("intlLocales", this.lang);

    this.rootLiveData.dateFormatter.setAll({dateFormat: { year:'numeric', month: '2-digit', "day": '2-digit',"hour": "numeric", "minute": "numeric" },dateFields: ['time'] });


    // Set themes
    this.rootLiveData.setThemes([
      am5themes_Animated.new(this.rootLiveData)
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    this.chart = this.rootLiveData.container.children.push(am5xy.XYChart.new(this.rootLiveData, {
      panX: false,
      panY: false,
      layout: this.rootLiveData.verticalLayout,
      maxTooltipDistance: 0
    }));
    this.chart.chartContainer.setAll({
      wheelable: false,
    })


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    this.xAxis = this.chart.xAxes.push(am5xy.DateAxis.new(this.rootLiveData, {
      maxDeviation: 1,
      baseInterval: {
        timeUnit: "minute",
        count: this.minBetweenTwoPoint
      },
      renderer: am5xy.AxisRendererX.new(this.rootLiveData, {
        minGridDistance: 120
      }),
      tooltip: am5.Tooltip.new(this.rootLiveData, {})
    }));

    this.xAxis.get("periodChangeDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("periodChangeDateFormats")["minute"] = { "hour": "numeric", "minute": "numeric" };
    this.xAxis.get("periodChangeDateFormats")["second"] = {"hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["minute"] = {"hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["second"] = { "hour": "numeric", "minute": "numeric" };
    this.xAxis.get("tooltipDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("tooltipDateFormats")["minute"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("tooltipDateFormats")["second"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };

    this.yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(this.rootLiveData, {
      renderer: am5xy.AxisRendererY.new(this.rootLiveData, {}),
      min: 0,
      tooltip: am5.Tooltip.new(this.rootLiveData, {})
    }));
    this.yAxis.children.moveValue(am5.Label.new(this.rootLiveData, { text: this.chartUoM, rotation: -90, y: am5.p50, centerX: am5.p50 }), 0);

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    this.series = this.chart.series.push(am5xy.SmoothedXLineSeries.new(this.rootLiveData, {
      name: this.chartData.description + " (" + this.chartUoM + ")",
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      valueYField: "informationValue",
      valueXField: "time",
      valueField: 'informationValue',
      fill: this.chartColor,
      stroke: this.chartColor,
      tooltip: am5.Tooltip.new(this.rootLiveData, {
        labelText: '{informationValue.formatNumber("#.0")} ' + this.chartUoM,
      })
    }));
    this.series.fills.template.setAll({
      fillOpacity: 0.3,
      visible: true
    });
    this.series.strokes.template.setAll({
      strokeWidth: 3,
    });

    this.series.events.on("datavalidated",(ev) => {
      this.isLoading = false;
    });

    // Set data
    this.series.data.setAll(this.chartData.values);

     // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    let scrollbarX = am5xy.XYChartScrollbar.new(this.rootLiveData, {
      orientation: 'horizontal',
      height: 50,
    });


    var sbxAxis = scrollbarX.chart.xAxes.push(
      am5xy.DateAxis.new(this.rootLiveData, {
        groupData: true,
        baseInterval: { timeUnit: 'minute', count: this.minBetweenTwoPoint },
        dateFormats: {
          hour: { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" },
          minute: { "hour": "numeric", "minute": "numeric" },
          second: { "hour": "numeric", "minute": "numeric" },
        },
        periodChangeDateFormats: {
          hour: { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" },
          minute: { "hour": "numeric", "minute": "numeric" },
          second: { "hour": "numeric", "minute": "numeric" },
        },
        renderer: am5xy.AxisRendererX.new(this.rootLiveData, {
          opposite: false,
          strokeOpacity: 0,
        }),
      }),
    );

    var sbyAxis = scrollbarX.chart.yAxes.push(
      am5xy.ValueAxis.new(this.rootLiveData, {
        renderer: am5xy.AxisRendererY.new(this.rootLiveData, {})
      })
    );

    var sbseries = scrollbarX.chart.series.push(
      am5xy.SmoothedXLineSeries.new(this.rootLiveData, {
        xAxis: sbxAxis,
        yAxis: sbyAxis,
        valueYField: 'informationValue',
        valueXField: 'time',
      })
    );
    sbseries.data.setAll(this.chartData.values);

    this.chart.set('scrollbarX', scrollbarX);

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = this.chart.set("cursor", am5xy.XYCursor.new(this.rootLiveData, {
      behavior: "zoomXY",
      xAxis: this.xAxis
    }));

    //Data Export
    if (this.canExportData) {
      let exporting = am5exporting.Exporting.new(this.rootLiveData, {
        menu: am5exporting.ExportingMenu.new(this.rootLiveData, {
          align: "left",
        }),
        dataSource: this.chartData.values
      });
    }

    this.showIndicator();

    if (this.chartData.values.length == 0) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    this.series.appear(1000);
    this.chart.appear(1000, 100);
  }


//Indicator
showIndicator() {
  this.indicator = this.rootLiveData.container.children.push(am5.Container.new(this.rootLiveData, {
    width: am5.p100,
    height: am5.p100,
    layer: 1000,
    background: am5.Rectangle.new(this.rootLiveData, {
      fill: am5.color(0xffffff),
      fillOpacity: 1.0
    })
  }));
  this.updateLabelIndicatorText();
}

  updateLabelIndicatorText() {
    this.indicatorLabel = this.indicator.children.push(am5.Label.new(this.rootLiveData, {
      fontSize: 20,
      x: am5.p50,
      y: am5.p50,
      centerX: am5.p50,
      centerY: am5.p50
    }));
    if (this.serverError === true) {
      this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
        this.indicatorLabel.set("text", translations["SHARED.Server_Error_While_Data_Loading"]);
      });
    } else if ((this.chartData?.length == 0) && !this.isLoading && (this.isLoading !== undefined)) {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        this.indicatorLabel.set("text", translations["SHARED.No_Data_Available"])
      });
    } else {
      this.indicatorLabel.set("text", '')
    }
  }

  generateId(length: number = 10) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
