import { AfterViewInit, Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5xy from "@amcharts/amcharts5/xy";
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../services';
import { BaseClass } from '../../common/base-class/base-class';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-multi-line-speed-chart',
  templateUrl: './multi-line-speed-chart.component.html',
  styleUrls: ['./multi-line-speed-chart.component.scss']
})
export class MultiLineSpeedChartComponent extends BaseClass implements AfterViewInit, OnChanges, OnDestroy {

  @Input() chartId = 'machineDetailsSpeedchartId' + this.generateId()

  @Input() minBetweenTwoPoint;
  @Input() chartData;
  @Input() speedUoM;
  @Input() canExportData: boolean = false;
  @Input() serverError: boolean = false;
  @Input() noDataAvailable: boolean = false;
  @Input() isLoading: boolean = true;
  @Input() showActualValue: boolean = false;

  rootSpeed: am5.Root;
  lang: string;
  xAxis: any;
  yAxis: any;
  indicator: any;
  chart: any;
  legend: any;
  seriesList: any[];
  indicatorLabel: any;
  scrollbarX: any;
  sbseries: any;
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
    am5.ready(() => {
      if(!this.rootSpeed  && this.chartData?.length > 0){
        //Get actual value
        this.getActualValue();
        
        setTimeout(() => {
          this.drawSpeedChart();
        }, 100);
      } else{
        if(changes.chartData) {
          this.sbseries?.data?.setAll(this.chartData);
          this.seriesList?.forEach(serie => {
            serie.datavalidation = false;
          });
          this.seriesList?.forEach(serie => {
            serie.data.setAll(this.chartData);
            this.updateLabelIndicatorText();
            if (this.chartData.length == 0) {
              this.indicator.show();
            } else {
              if (this.indicator) {
                this.indicator.hide();
              }
            }
          });
          //Get actual value
          this.getActualValue();
        }
      }
    });
  }

  getActualValue() {
    if (this.chartData) {
      if((this.chartData?.length - 1) > 0){
        const data = this.chartData.reverse();
    
        for(let el of data){
          if (el?.speed || el?.speed == 0) {
            this.actualValue = this.trim(el.speed, 2) 
            break;
          }
        }
      }
    }
  }


  ngAfterViewInit(): void {
    am5.ready(() => {

        setTimeout(() => {
          this.drawSpeedChart();
        }, 100);
      // }
    });
  }

  ngOnDestroy() {
    if (this.rootSpeed) {
      this.rootSpeed.dispose();
    }
  }

  drawSpeedChart() {
    if(this.rootSpeed) return;

    this.isLoading = true;
    this.rootSpeed = am5.Root.new(this.chartId);
    this.rootSpeed.durationFormatter.set('durationFormat', "dd'd' hh'h' mm'min'");
    this.rootSpeed.numberFormatter.set('numberFormat', '#.##');

    this.rootSpeed.dateFormatter.set("intlLocales", this.lang);
    this.rootSpeed.numberFormatter.set("intlLocales", this.lang);

    this.rootSpeed.dateFormatter.setAll({dateFormat: { year:'numeric', month: '2-digit', "day": '2-digit',"hour": "numeric", "minute": "numeric" },dateFields: ['time'] });


    // Set themes
    this.rootSpeed.setThemes([
      am5themes_Animated.new(this.rootSpeed)
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    this.chart = this.rootSpeed.container.children.push(am5xy.XYChart.new(this.rootSpeed, {
      panX: false,
      panY: false,
      layout: this.rootSpeed.verticalLayout,
      maxTooltipDistance: 0
    }));
    this.chart.chartContainer.setAll({
      wheelable: false,
    })

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    this.xAxis = this.chart.xAxes.push(am5xy.DateAxis.new(this.rootSpeed, {
      maxDeviation: 1,
      baseInterval: {
        timeUnit: "minute",
        count: this.minBetweenTwoPoint
      },
      renderer: am5xy.AxisRendererX.new(this.rootSpeed, {
        minGridDistance: 120
      }),
      tooltip: am5.Tooltip.new(this.rootSpeed, {
      })
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


    this.yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(this.rootSpeed, {
      renderer: am5xy.AxisRendererY.new(this.rootSpeed, {}),
      min: 0,
      tooltip: am5.Tooltip.new(this.rootSpeed, {})
    }));
    this.yAxis.children.moveValue(
      am5.Label.new(this.rootSpeed, { text: this.speedUoM, rotation: -90, y: am5.p50, centerX: am5.p50 }), 0);

    let speedPVText = ''
    let speedSPText = ''
    let MOMSpeedSPText = ''
    this.translate.get(["COMMON.Machine_Actual_speed","COMMON.SpeedSetpoint","COMMON.MOM_speed_SP"]).subscribe((translations) => {
      speedPVText = translations["COMMON.Machine_Actual_speed"];
      speedSPText = translations["COMMON.SpeedSetpoint"];
      MOMSpeedSPText = translations["COMMON.MOM_speed_SP"];
    });

    this.seriesList = [];

    if(this.chartData && this.chartData.length) {
      this.chartData.sort(function(a, b) {
        if (a.time > b.time)
          return 1;
        else if (a.time < b.time)
          return -1;
        else
          return 0;
      })
    }

    this.createSeries("speed", "time", speedPVText, am5.color(this.config.getColor('success')), 3, true);

    this.createSeries("setPoint", "time", speedSPText, am5.color(this.config.getColor('primary')), 3, false);
    this.createSeries("MOMSpeed", "time", MOMSpeedSPText, am5.color(this.config.getColor('grey_4')), 2, false);

    // console.log(this.chartData)
       // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    this.scrollbarX = am5xy.XYChartScrollbar.new(this.rootSpeed, {
      orientation: 'horizontal',
      height: 50,
    });



    var sbxAxis = this.scrollbarX.chart.xAxes.push(
      am5xy.DateAxis.new(this.rootSpeed, {
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
        renderer: am5xy.AxisRendererX.new(this.rootSpeed, {
          opposite: false,
          strokeOpacity: 0,
        }),
      }),
    );

    var sbyAxis = this.scrollbarX.chart.yAxes.push(
      am5xy.ValueAxis.new(this.rootSpeed, {
        renderer: am5xy.AxisRendererY.new(this.rootSpeed, {})
      })
    );

    this.sbseries = this.scrollbarX.chart.series.push(
      am5xy.SmoothedXLineSeries.new(this.rootSpeed, {
        xAxis: sbxAxis,
        yAxis: sbyAxis,
        valueYField: 'speed',
        valueXField: 'time',
      })
    );

    // this.sbseries.events.on("datavalidated",(ev) => {
    //   this.isLoading = false;
    // });

    if(this.chartData){
      this.sbseries.data.setAll(this.chartData);
    }


    this.chart.set('scrollbarX', this.scrollbarX);

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = this.chart.set("cursor", am5xy.XYCursor.new(this.rootSpeed, {
      behavior: "zoomXY",
      // snapToSeries: [ serieSpeedPV, serieSpeedSP , serieMOMSpeedSP ],
      xAxis: this.xAxis
    }));

    //Legend
    this.legend = this.chart.children.push(am5.Legend.new(this.rootSpeed, {
      x: am5.p50,
      centerX: am5.p50,
    }));
    this.legend.data.setAll(this.chart.series.values);

    this.showIndicator();

    if (!this.chartData || this.chartData.length == 0) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

    //Data Export
    if (this.canExportData) {
      let exporting = am5exporting.Exporting.new(this.rootSpeed, {
        menu: am5exporting.ExportingMenu.new(this.rootSpeed, {
          align: "left",
        }),
        dataSource: this.chartData
      });

    }

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    //serieSpeedPV.appear(1000);
    // serieSpeedSP.appear(1000);
    // serieMOMSpeedSP.appear(1000);
    this.chart.appear(1000, 100);

  }



//Indicator
showIndicator() {
  this.indicator = this.rootSpeed.container.children.push(am5.Container.new(this.rootSpeed, {
    width: am5.p100,
    height: am5.p100,
    layer: 1000,
    background: am5.Rectangle.new(this.rootSpeed, {
      fill: am5.color(0xffffff),
      fillOpacity: 1.0
    })
  }));
  this.updateLabelIndicatorText();
}

updateLabelIndicatorText() {

  this.indicatorLabel = this.indicator.children.push(am5.Label.new(this.rootSpeed, {
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
  } else if
  (
    (this.chartData?.length === 0 || this.chartData?.machineSpeed === null)
    && !this.isLoading && (this.isLoading !== undefined)
    || this.noDataAvailable === true
  ) {

    this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
      this.indicatorLabel.set("text", translations["SHARED.No_Data_Available"])
    });
  } else {
    this.indicatorLabel.set("text", '')
  }
}

  createSeries(categoryName: string, valueName: string, labelTitle: string, color: am5.Color, lineStroke: number, showBackground: boolean) {
    let series = this.chart.series.push(am5xy.SmoothedXLineSeries.new(this.rootSpeed, {
      name: labelTitle  + " " + this.speedUoM,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      valueYField: categoryName,
      valueXField: valueName,
      fill: color,
      stroke: color,
      tooltip: am5.Tooltip.new(this.rootSpeed, {
        labelText: labelTitle + ': {valueY.formatNumber("#.00")} '  + this.speedUoM,
      })
    }));
    series.strokes.template.setAll({
      strokeWidth: lineStroke,
    });
    if(showBackground){
      series.fills.template.setAll({
        fillOpacity: 0.3,
        visible: true
      });
    }

    // Set data

    if(this.chartData) {
      series.data.setAll(this.chartData);
    }

    series.datavalidation = false;
    this.seriesList.push(series);

    series.events.on("datavalidated",() => {
      series.datavalidation = true;
      // let notValidatedSeries: any = this.seriesList.find((serieToFilter) => { serieToFilter.datavalidation === false;})
      let notValidatedSeries = true;
      this.seriesList.forEach((serieToFilter) => {

        if (serieToFilter.datavalidation === false && notValidatedSeries === true) {
          notValidatedSeries = false;
        }

      });
      if(notValidatedSeries){
        setTimeout(() => {
          this.isLoading = false
        }, 1000);
      }
    });
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
