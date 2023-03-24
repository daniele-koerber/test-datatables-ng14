import { BaseClass } from './../../common/base-class/base-class';
import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ConfigurationData } from '../../../data/configuration';
import { ConfigService } from '../../services';
import { Circle } from '@amcharts/amcharts5';
import { MachineSpeed_FE, MachineParameterSpeed_FE, ProgressiveMachineProductionCounter_FE, AlarmHeldOccurencies_FE } from '../../models/presentation/integration/machine-history';
import { TranslateService } from '@ngx-translate/core';
import { DataItem } from '@amcharts/amcharts4/.internal/core/DataItem';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-machine-history-chart',
  templateUrl: './machine-history-chart.component.html',
  styleUrls: ['./machine-history-chart.component.scss'],
})
export class MachineHistoryChartComponent extends BaseClass implements OnInit, OnChanges, OnDestroy {


  // @Input() data: any;
  @Input() chartId: string;
  @Input() height: string = '200px';
  @Input() hoursToDisplay: number;

  @Input() hideDateAxis: boolean = false;
  @Input() showScrollBarX: boolean = false;

  @Input() machineSpeeds: Array<MachineSpeed_FE> = []

  @Input() machineSpeedsUoM: string = "";

  @Input() parameterSpeeds: Array<MachineParameterSpeed_FE> = []

  @Input() productionCounter: Array<ProgressiveMachineProductionCounter_FE> = []

  @Input() occurrencesList: Array<AlarmHeldOccurencies_FE> = []

  root: am5.Root;
  chart: am5xy.XYChart;
  series: am5xy.LineSeries;
  tooltipFormat: string;
  circleTemplate: am5.Template<Circle>;
  selectedDataItem: any;
  bubbleClick: any;
  seriesLowerChart: any;
  seriesUpperChart: any;
  seriesSetPointChart: am5xy.LineSeries;
  seriesProductionChart: any;
  seriesBubbleAlarmsChart: any;
  hourAxis: am5xy.ValueAxis<am5xy.AxisRenderer>;
  indicator: any;
  indicatorLabel: any;

  showInfo = false;
  machineSpeedsPreparedForChart: Array<MachineSpeed_FE> = [];
  scrollBarData: MachineSpeed_FE[];
  sbseries: any;
  scrollbarX: any;
  topSpeed: number = 0;
  lang: string;
  yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>;
  prodAxis: am5xy.ValueAxis<am5xy.AxisRenderer>;
  legend: am5.Legend;

  constructor(
    private configurationService: ConfigurationData,
    private config: ConfigService,
    private translate: TranslateService,
    private nbAuthService: NbAuthService
    ) {
      super(nbAuthService);
      const langsArr = config.getLanguages().map(el => el.key);
      translate.addLangs(langsArr);
      translate.setDefaultLang(langsArr[0]);
      this.lang = config.getSelectedLanguage();
      translate.use(this.lang);
    }
  ngOnInit(): void {

  }


  ngAfterViewInit(): void {
    // this.drawChart();
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (this.chart) {

      if(changes.machineSpeeds?.currentValue || changes.occurrencesList?.currentValue || changes.parameterSpeeds?.currentValue || changes.productionCounter?.currentValue ||
          changes.serverError?.currentValue ){
        if (!this.root) {
          if (this.showScrollBarX) {
            am5.ready(() => {
              setTimeout(() => {
                this.drawChart();
              }, 100);
            });
          } else {
            this.drawChart();
          }

        }  else {
          this.updateChartData();
          this.updateLabelIndicatorText();
        }
      }
  }

  drawChart() {
    if (this.showScrollBarX && this.machineSpeeds) {
      this.scrollBarData = JSON.parse(JSON.stringify(this.machineSpeeds));
    } else {
      this.scrollBarData = [];
    }
    this.topSpeed = 0;

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    this.root = am5.Root.new(this.chartId);

    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    this.root.dateFormatter.set("intlLocales", this.lang);
    this.root.dateFormatter.setAll({
      dateFormat: { hour: '2-digit', minute: '2-digit' },
      dateFields: ['alarmStart','dateTime'],
    });

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        maxTooltipDistance: 1,
        //paddingBottom: 50,
      }),
    );

    this.chart.set('paddingBottom',this.showScrollBarX ? 50 : 0)

    if (this.machineSpeeds === null || this.machineSpeeds === undefined || this.machineSpeeds?.length === 0 || this.serverError) {
      this.showIndicator();
      this.noData = !this.serverError ;
      if (this.serverError || this.noData) {
        this.indicator.show();
        this.showInfo = false;
      } else {
        if (this.indicator) {
          this.indicator.hide();
        }
      }

      return null
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }




    this.parameterSpeeds.sort((firstItem: any, secondItem: any) => firstItem.$id - secondItem.$id)
    let setpoint = 0;
    let isUnderSetpoint = false;

    this.machineSpeeds.forEach((sp, index) => {
      this.topSpeed = this.topSpeed < sp.speed ? sp.speed : this.topSpeed;
      this.parameterSpeeds.sort((firstItem: any, secondItem: any) => firstItem.$id - secondItem.$id).forEach((param, indexParam) => {
        if(param.date <= sp.date && this.parameterSpeeds[indexParam + 1]?.date >= sp.date) {
          setpoint = param.speed === this.parameterSpeeds[indexParam + 1]?.speed ? param.speed : 0;
        }
      })

      if(sp.speed >= setpoint) {
        sp.underspeed = setpoint
        const speedObjnext = JSON.parse(JSON.stringify(this.machineSpeeds[index + 1]))
        if(isUnderSetpoint === true || speedObjnext.speed <= setpoint) {
          const speedObj = JSON.parse(JSON.stringify(sp))
          speedObj.speed = setpoint
          sp.date += isUnderSetpoint ? 1 : 0;

          this.machineSpeeds.push(speedObj)
        }
        isUnderSetpoint = false;
      }
      if(sp.speed < setpoint && sp.speed !== null && sp.speed !== undefined) {
        sp.underspeed = sp.speed
        sp.speed = null

        if (isUnderSetpoint !== true && index !== 0) {
          const speedObj = JSON.parse(JSON.stringify(this.machineSpeeds[index - 1]))
          const speedObjnext = JSON.parse(JSON.stringify(this.machineSpeeds[index + 1]))
          if (speedObjnext.speed >= setpoint) {
            speedObj.speed = setpoint;
            speedObj.underspeed = setpoint;
            this.machineSpeeds.push(speedObj)
          }

        }

        isUnderSetpoint = true
      }
    });

    this.machineSpeedsPreparedForChart = this.machineSpeeds;

    const hourRenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 60,
    });
    hourRenderer.grid.template.set('visible', false);
    hourRenderer.labels.template.adapters.add('text', (text, target): string => {
      return +text === 0 ? 'Now' : text + 'h';
    });
    hourRenderer.labels.template.setAll({
      fontSize: '10px',
      opacity: 0.5,
    });

    let xRenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 70
    });
    xRenderer.labels.template.setAll({
      fontSize: '10px',
      opacity: 0.5,
    });

    xRenderer.grid.template.set("visible", false);

    let yRenderer = am5xy.AxisRendererY.new(this.root, {});
    yRenderer.labels.template.setAll({
      fontSize: '10px',
      paddingRight: 20,
      opacity: 0.5,
    });

    this.hourAxis = this.chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
      maxDeviation: 50,
      min: -this.hoursToDisplay,
      max: 0,
      renderer: hourRenderer,
      visible: false//this.hideDateAxis,
    }));

    const xAxis = this.chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        maxDeviation: 50,
        baseInterval: { timeUnit: "minute", count: 1 },
        renderer: xRenderer,
        visible: true,// /!this.hideDateAxis,
      })
    );
    xAxis.get("periodChangeDateFormats")["minute"] = { "hour": "numeric", "minute": "numeric" };
    xAxis.get("periodChangeDateFormats")["second"] = {"hour": "numeric", "minute": "numeric" };
    xAxis.get("dateFormats")["minute"] = {"hour": "numeric", "minute": "numeric" };
    xAxis.get("dateFormats")["second"] = { "hour": "numeric", "minute": "numeric" };
    xAxis.get("tooltipDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    xAxis.get("tooltipDateFormats")["minute"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    xAxis.get("tooltipDateFormats")["second"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    if (this.showScrollBarX) {
      xAxis.get("periodChangeDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
      xAxis.get("dateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    } else {
      xAxis.get("periodChangeDateFormats")["hour"] = { "hour": "numeric", "minute": "numeric" };
      xAxis.get("dateFormats")["hour"] = {"hour": "numeric", "minute": "numeric" };
    }


    const prodRenderer = am5xy.AxisRendererY.new(this.root, {opposite: true});
    prodRenderer.grid.template.set("visible", false);
    prodRenderer.labels.template.setAll({
      fontSize: '10px',
      opacity: 0.9,
      fill: am5.color(this.config.getColor('primary'))
    });
    this.prodAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        maxDeviation:1,
        renderer: prodRenderer
      }),
    );

    this.yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
        maxDeviation:1,
        // max: this.topSpeed + (this.topSpeed *0.01),
        renderer: yRenderer
      }),
    );
    this.yAxis.set("max",this.topSpeed + (this.topSpeed *0.01))
    // yAxis.get('renderer').labels.template.adapters.add('text', (text, target): string => {
    //   return text + "" + this.machineSpeedsUoM;
    // });

    this.yAxis.children.unshift(am5.Label.new(this.root, { text: this.machineSpeedsUoM + '/min', rotation: -90, y: am5.p50, centerX: am5.p50 }));
    this.prodAxis.children.push(am5.Label.new(this.root, { text: this.machineSpeedsUoM, rotation: -90, y: am5.p50, centerX: am5.p50, fill: am5.color(this.config.getColor('primary'))}));

    let underSpeedText = ''
    let upperSpeedText = ''
    let alarmText = ''
    let setPointText = ''
    let piecesCounterText = ''
    this.translate.get(["COMMON.Under_Speed","COMMON.Upper_Speed","COMMON.Alarm","COMMON.Set_Point","COMMON.Pieces_Counter"]).subscribe((translations) => {
      underSpeedText = translations["COMMON.Under_Speed"];
      upperSpeedText = translations["COMMON.Upper_Speed"];
      alarmText = translations["COMMON.Alarm"];
      setPointText = translations["COMMON.Set_Point"];
      piecesCounterText = translations["COMMON.Pieces_Counter"];
    });

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    this.seriesLowerChart = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: underSpeedText,
        xAxis: xAxis,
        yAxis: this.yAxis,
        connect: false,
        valueYField: "underspeed",
        valueXField: "date",
        stroke: am5.color(this.config.getColor('error')),
        fill: am5.color(this.config.getColor('error')),
        tooltip: am5.Tooltip.new(this.root, {
          labelText: this.showScrollBarX ? '{name}: {underspeed.formatNumber("#.##")}' : '[fontSize:11px;]{name}: {underspeed.formatNumber("#.##")}'
        })

      }),
    );

    //Make background gradient chart
    this.seriesLowerChart.fills.template.set("fillGradient", am5.LinearGradient.new(this.root, {
      stops: [{
        color: am5.color(this.config.getColor('error')),
        opacity: 1
      }, {
        color: am5.color(this.config.getColor('error')),
        opacity: 0
      }]
    }));



    this.seriesUpperChart = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: upperSpeedText,
        xAxis: xAxis,
        yAxis: this.yAxis,
        connect: false,
        valueYField: "speed",
        openValueYField: "underspeed",
        valueXField: "date",
        stroke: am5.color(this.config.getColor('success')),
        fill: am5.color(this.config.getColor('success')),
        tooltip: am5.Tooltip.new(this.root, {
          labelText: this.showScrollBarX ? '{name}: {speed.formatNumber("#.##")}' : '[fontSize:11px;]{name}: {speed.formatNumber("#.##")}'
        })

      }),
    );

    //Make background gradient chart
    this.seriesUpperChart.fills.template.set("fillGradient", am5.LinearGradient.new(this.root, {
      stops: [{
        color: am5.color(this.config.getColor('success')),
        opacity: 1
      }, {
        color: am5.color(this.config.getColor('success')),
        opacity: 0.5
      }]
    }));


    let tooltipSetPoint = am5.Tooltip.new(this.root, {
      getFillFromSprite: false,
      labelText: this.showScrollBarX ? '{name}: {speed.formatNumber("#.##")}' : '[fontSize:11px;]{name}: {speed.formatNumber("#.##")}',
    });

    tooltipSetPoint.get("background").setAll({
      fill: am5.color(this.config.getColor('grey_7')),
      fillOpacity: 0.8
    });

    this.seriesSetPointChart = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: setPointText,
        xAxis: xAxis,
        yAxis: this.yAxis,
        valueYField: "speed",
        valueXField: "date",
        stroke: am5.color(this.config.getColor('grey_7')),
        tooltip: tooltipSetPoint
      }),
    );

    let tooltipProduction = am5.Tooltip.new(this.root, {
      getFillFromSprite: false,
      labelText: this.showScrollBarX ? '{name}: {valueY.formatNumber("#.##")}' : '[fontSize:11px;]{name}: {valueY.formatNumber("#.##")}'
    });

    tooltipProduction.get("background").setAll({
      fill: am5.color(this.config.getColor('primary')),
      fillOpacity: 0.8
    });


    this.seriesProductionChart = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: piecesCounterText,
        xAxis: xAxis,
        yAxis: this.prodAxis,
        valueYField: "production",
        valueXField: "date",
        stroke: am5.color(this.config.getColor('primary')),
        tooltip: tooltipProduction
      }),
    );

    this.seriesUpperChart.fills.template.setAll({
      fillOpacity: 0.3,
      visible: true,
    });

    this.seriesLowerChart.fills.template.setAll({
      fillOpacity: 0.3,
      visible: true,
    });

    this.seriesLowerChart.strokes.template.set("strokeWidth", 1);
    this.seriesUpperChart.strokes.template.set("strokeWidth", 1);
    this.seriesSetPointChart.strokes.template.set("strokeWidth", 3);
    this.seriesProductionChart.strokes.template.set("strokeWidth", 2);


    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
      this.seriesBubbleAlarmsChart = this.chart.series.push(am5xy.LineSeries.new(this.root, {
        name: alarmText,
        xAxis: xAxis,
        yAxis: this.yAxis,
        valueYField: "speed",
        valueXField: "date",
        valueField: "speed",
        stroke: am5.color(this.config.getColor('error')),
        fill: am5.color(this.config.getColor('error')),
        tooltip: am5.Tooltip.new(this.root, {
        labelText: this.showScrollBarX ? "{alarmStart} - {name} ({durationString} min)" : "[fontSize:11px;]{alarmStart}\n{name} ({durationString} min)"
      })
    }));


    // Add bullet
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Bullets
    this.circleTemplate = am5.Template.new({});

    this.circleTemplate.states.create("transparent", { opacity: 0.15 });

    this.circleTemplate.events.on("pointerover", (event) => {this.handleOver(event)});
    this.circleTemplate.events.on("pointerout",  (event) => {this.handleOut(event)});
    this.circleTemplate.events.on("click",  (event) => {this.handleClick(event)});

    this.seriesBubbleAlarmsChart.bullets.push(()=> {
      var graphics = am5.Circle.new(this.root, {
        fill: this.seriesBubbleAlarmsChart.get("fill"),
      }, this.circleTemplate);
      return am5.Bullet.new(this.root, {
        sprite: graphics
      });
    });
    // Add heat rule
    // https://www.amcharts.com/docs/v5/concepts/settings/heat-rules/
    // this.seriesBubbleAlarmsChart.set("heatRules", [{
    //   target: this.circleTemplate,
    //   min: 10,
    //   max: 10,
    //   dataField: "value",
    //   key: "radius"
    // }]);

    this.seriesBubbleAlarmsChart.strokes.template.set("strokeOpacity", 0);

    // this.seriesBubbleAlarmsChart.data.processor = am5.DataProcessor.new(this.root, {
    //   dateFields: ["date"], //dateFormat: "yyyy-MM-dd"
    // });

    // Add cursor
    var cursor = am5xy.XYCursor.new(this.root, {
      xAxis: xAxis,
      yAxis: this.yAxis,
      snapToSeries: [ this.seriesBubbleAlarmsChart,
                      this.seriesUpperChart,
                      this.seriesLowerChart,
                      this.seriesSetPointChart,
                      this.seriesProductionChart,],
      behavior: "zoomXY",
    })
    // cursor.lineX.setAll({
    //   visible: false
    // });

    // cursor.lineY.setAll({
    //   visible: false
    // });

    // if (this.showScrollBarX) {
      this.chart.set("cursor", cursor);
    // }

     // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    this.scrollbarX = this.chart.set("scrollbarX", am5xy.XYChartScrollbar.new(this.root, {
      orientation: "horizontal",
      height: 60
    }));

    //this.chart.set('scrollbarX', this.scrollbarX);

    var sbxAxis = this.scrollbarX.chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'second', count: 1 },
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
        renderer: am5xy.AxisRendererX.new(this.root, {
          opposite: false,
          strokeOpacity: 0,
        }),
      }),
    );

    // sbxAxis.get("dateFormats")["minute"] = {hour: '2-digit', minute: '2-digit'};

    var sbyAxis = this.scrollbarX.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {})
      })
    );

    this.sbseries = this.scrollbarX.chart.series.push(
      am5xy.SmoothedXLineSeries.new(this.root, {
        xAxis: sbxAxis,
        yAxis: sbyAxis,
        valueYField: 'speed',
        valueXField: 'date',
      })
    );

    this.scrollbarX.set('visible', this.showScrollBarX) //this.showScrollBar

    this.sbseries.data.setAll(this.scrollBarData.sort((firstItem, secondItem) => firstItem.date - secondItem.date));

    const data = this.machineSpeedsPreparedForChart.sort((firstItem, secondItem) => firstItem.date - secondItem.date);
    // this.sbseries.data.processor = am5.DataProcessor.new(this.root, {
    //   dateFields: ['date'], dateFormat: 'yyyy-MM-dd HH:mm'
    // });


    this.seriesLowerChart.data.setAll(data);
    this.seriesUpperChart.data.setAll(data);

    this.seriesSetPointChart.data.setAll(this.parameterSpeeds);
    this.seriesProductionChart.data.setAll(this.productionCounter);
    
    if(this.root?.height() <= 700){
      this.occurrencesList.forEach(occ => {
        occ.speed = this.topSpeed * 0.005;
      });
    } else {
      this.occurrencesList.forEach(occ => {
        occ.speed = this.topSpeed * 0.015;
      });
    }
    this.seriesBubbleAlarmsChart.data.setAll(this.occurrencesList);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    this.seriesLowerChart.appear(1000);
    this.seriesUpperChart.appear(1000);
    this.seriesSetPointChart.appear(1000);
    this.seriesProductionChart.appear(1000);
    this.seriesBubbleAlarmsChart.appear(1000);
    this.chart.appear(1000, 100);

    this.legend = this.chart.children.push(am5.Legend.new(this.root, {
      centerX: am5.p50,
      x: am5.p50,
      y: am5.p100,
      paddingTop: 20,
      clickTarget: "none",
    }));

    this.legend.data.clear()
    this.legend.data.push(this.seriesUpperChart);
    this.legend.data.push(this.seriesLowerChart);
    this.legend.data.push(this.seriesSetPointChart);
    this.legend.data.push(this.seriesProductionChart);
    this.legend.data.push(this.seriesBubbleAlarmsChart);

    this.legend.set('visible', this.showScrollBarX);


    this.showIndicator();

    if ((data?.length === 0) && this.parameterSpeeds?.length === 0 && this.productionCounter?.length === 0 && this.occurrencesList?.length === 0 ) {
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
    } else if (this.noData && !this.isLoading)  {
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

    if (this.machineSpeeds === null || this.machineSpeeds === undefined || this.machineSpeeds?.length === 0 || this.serverError) {
      this.noData = this.parameterSpeeds?.length === 0 && this.productionCounter?.length === 0 && this.occurrencesList?.length === 0 ;
      this.updateLabelIndicatorText();
      if ((this.serverError || this.noData) && this.indicator) {
        this.indicator.show();
        this.showInfo = false;
      } else {
        if (this.indicator) {
          this.indicator.hide();
        }
      }
      console.log("MACHINE CHART FULL HISTORY WITH NO DATA ")
      return null
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

    this.parameterSpeeds.sort((firstItem: any, secondItem: any) => firstItem.$id - secondItem.$id)
    let setpoint = 0;
    let isUnderSetpoint = false;


    if (this.showScrollBarX && this.machineSpeeds) {
      this.scrollBarData = JSON.parse(JSON.stringify(this.machineSpeeds));
    } else {
      this.scrollBarData = [];
    }
    this.topSpeed = 0;

    this.machineSpeeds.forEach((sp, index) => {
      this.topSpeed = this.topSpeed < sp.speed ? sp.speed : this.topSpeed;
      this.parameterSpeeds.sort((firstItem: any, secondItem: any) => firstItem.$id - secondItem.$id).forEach((param, indexParam) => {
        if(param.date <= sp.date && this.parameterSpeeds[indexParam + 1]?.date >= sp.date) {
          setpoint = param.speed === this.parameterSpeeds[indexParam + 1]?.speed ? param.speed : 0;
        }
      })

      if(sp.speed >= setpoint) {
        sp.underspeed = setpoint
        const speedObjnext = JSON.parse(JSON.stringify(this.machineSpeeds[index + 1]))
        if(isUnderSetpoint === true || speedObjnext.speed <= setpoint) {
          const speedObj = JSON.parse(JSON.stringify(sp))
          speedObj.speed = setpoint
          sp.date += isUnderSetpoint ? 1 : 0;

          this.machineSpeeds.push(speedObj)
        }
        isUnderSetpoint = false;
      }
      if(sp.speed < setpoint && sp.speed !== null && sp.speed !== undefined) {
        sp.underspeed = sp.speed
        sp.speed = null

        if (isUnderSetpoint !== true && index !== 0) {
          const speedObj = JSON.parse(JSON.stringify(this.machineSpeeds[index - 1]))
          const speedObjnext = JSON.parse(JSON.stringify(this.machineSpeeds[index + 1]))
          if (speedObjnext.speed >= setpoint) {
            speedObj.speed = setpoint;
            speedObj.underspeed = setpoint;
            this.machineSpeeds.push(speedObj)
          }

        }

        isUnderSetpoint = true
      }
    });

    if(this.root?.height() <= 700){
      this.occurrencesList.forEach(occ => {
        occ.speed = this.topSpeed * 0.06;
      });
    } else {
      this.occurrencesList.forEach(occ => {
        occ.speed = this.topSpeed * 0.015;
      });
    }

    if (this.scrollBarData) {
      this.sbseries.data.setAll(this.scrollBarData.sort((firstItem, secondItem) => firstItem.date - secondItem.date));
    }

    this.machineSpeedsPreparedForChart = this.machineSpeeds.sort((firstItem, secondItem) => firstItem.date - secondItem.date);
    const data = this.machineSpeedsPreparedForChart//.sort((firstItem, secondItem) => firstItem.date - secondItem.date);
    this.seriesLowerChart.data.setAll(data);
    this.seriesUpperChart.data.setAll(data);

    this.yAxis.children.shift();
    this.prodAxis.children.pop();

    this.yAxis.children.unshift(am5.Label.new(this.root, { text: this.machineSpeedsUoM + '/min', rotation: -90, y: am5.p50, centerX: am5.p50 }));
    this.prodAxis.children.push(am5.Label.new(this.root, { text: this.machineSpeedsUoM, rotation: -90, y: am5.p50, centerX: am5.p50, fill: am5.color(this.config.getColor('primary'))}));

    this.seriesSetPointChart.data.setAll(this.parameterSpeeds);
    this.seriesProductionChart.data.setAll(this.productionCounter);

    this.seriesBubbleAlarmsChart.data.setAll(this.occurrencesList);

    this.legend.data.clear();

    this.legend.data.push(this.seriesUpperChart);
    this.legend.data.push(this.seriesLowerChart);
    this.legend.data.push(this.seriesSetPointChart);
    this.legend.data.push(this.seriesProductionChart);
    this.legend.data.push(this.seriesBubbleAlarmsChart);

    this.legend.set('visible', this.showScrollBarX)

    this.hourAxis.set('min', -this.hoursToDisplay);
    this.yAxis.set("max",this.topSpeed + (this.topSpeed *0.01))

    // if (this.newChartData?.length > 0)
    //   this.series.data.setAll(this.newChartData.sort((firstItem, secondItem) => firstItem.time - secondItem.time));
  }



  handleOver(e) {
    var target = e.target;
    am5.array.each(this.seriesBubbleAlarmsChart.dataItems, (dataItem: am5.DataItem<DataItem>) => {
      if (dataItem.bullets) {
        var bullet = dataItem?.bullets[0];
        if (bullet) {
          var sprite = bullet.get("sprite");
          if (sprite && sprite != target) {
            sprite.states.applyAnimate("transparent");
          }
        }
      }
    })
  }

  handleOut(e) {
    am5.array.each(this.seriesBubbleAlarmsChart.dataItems, (dataItem: am5.DataItem<DataItem>) => {
      if (dataItem.bullets) {
        var bullet = dataItem.bullets[0];
        if (bullet) {
          var sprite = bullet.get("sprite");
          if (sprite) {
            sprite.states.applyAnimate("default");
          }
        }
      }
    })
  }

  handleClick(e) {
    if (this.selectedDataItem == e.target.dataItem) {
      am5.array.each(this.seriesBubbleAlarmsChart.dataItems, (dataItem: am5.DataItem<DataItem>) =>{
        var bullet = dataItem.bullets[0];
        var sprite = bullet.get('sprite');
        sprite.set('opacity', 1);
      })
    }
    else {
      this.selectedDataItem = e.target.dataItem;
      am5.array.each(this.seriesBubbleAlarmsChart.dataItems, (dataItem: am5.DataItem<DataItem>) =>{
        var bullet = dataItem.bullets[0];
        var sprite = bullet.get('sprite');
        if (dataItem != this.selectedDataItem) {
          sprite.set('opacity', 0.15);
        }
        else {
          sprite.set('opacity', 1);
        }
      })
    }
  }





}



