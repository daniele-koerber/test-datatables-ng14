import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { elastic } from '@amcharts/amcharts5/.internal/core/util/Ease';
import { DataItem } from '@amcharts/amcharts4/core';
import { LineSeries } from '@amcharts/amcharts4/charts';
import { start } from 'repl';
import { ConfigService, SignalRNotificationService } from '../../services';
import { ConfigurationData } from '../../../data/configuration';
import { SchedulingData } from '../../../data/scheduling';
import { TranslateService } from '@ngx-translate/core';
import { IntegrationData } from '../../../data/integration';
import { BaseClass } from '../../common/base-class/base-class';
import { NbAuthService } from '@nebular/auth';


@Component({
  selector: 'ngx-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.scss']
})
export class ScatterChartComponent extends BaseClass implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  colors = {
    success: "#00c013",
    warning: "#FFD370",
    danger: "#CE3800",
    backgound: "#262523",
    hidden: '#ffffff'
  }

  @Input() data = [];
  @Input() toggleValue: any = true;

  @Input() startDate;
  @Input() endDate;

  @Output() bubbleClick: EventEmitter<any> = new EventEmitter<any>();

  chartId = 'scatterdiv';

 selectedDataItem;

 firstLoad: boolean = true;

  root: am5.Root;
  chart: am5xy.XYChart;
  yAxis: am5xy.ValueAxis<am5xy.AxisRenderer>;
  xAxis: am5xy.DateAxis<am5xy.AxisRenderer>;
  circleTemplate: am5.Template<any>;
  bubbleSeries: am5xy.LineSeries = null;
  bubbleTooltip: any;
  tooltipFormat: string = ``;

  orderFormat: string = `[fontSize:12px; bold]OEE: {oeeValue.numberFormat()}%[/]\n[fontSize:11px;]Order Id: {orderID}\nProduct Code: {productCode}\nProduct Description': {productDescription}\n\nProcess Cell: {processCell}\nStart Time: {startDate}\nEnd Time: {endDate}\nDuration: {duration.formatDuration()}[/]`;
  shiftFormat: string = `[fontSize:12px; bold]OEE: {oeeValue.numberFormat()}%[/]\n[fontSize:11px;]Team: {teamName}\nProcess Cell: {processCell}\nStart Time: {startDate}\nEnd Time: {endDate}\nDuration: {duration.formatDuration()}[/]`;
  lang: string;

  showInfo = false;
  indicator: any;
  indicatorLabel: any;
  serverError: boolean = false;


  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private scheduleService: SchedulingData,
    private translate: TranslateService,
    private integrationService: IntegrationData,
    private signalR: SignalRNotificationService,
    private nbAuthService: NbAuthService
    ) {
      super(nbAuthService);
      const langsArr = config.getLanguages().map(el => el.key);
      translate.addLangs(langsArr);
      translate.setDefaultLang(langsArr[0]);
      this.lang = config.getSelectedLanguage();
      translate.use(this.lang);
      translate.get(
        ['OVERVIEW.OEE',
        'SHARED.Order',
        'OVERVIEW.Product_Code',
        'REPORT.Process_Cell',
        'REPORT.Duration',
        'OVERVIEW.Team',
        'PRODUCT_DEFINITION.Product_Description',
        'OVERVIEW.Start_Time',
        'OVERVIEW.End_Time']).subscribe((translations) => {
          this.orderFormat = `[fontSize:12px; bold]${translations['OVERVIEW.OEE']}: {oeeValue.numberFormat()}%[/]\n[fontSize:11px;]${translations['SHARED.Order']}: {orderID}\n${translations['OVERVIEW.Product_Code']}: {productCode}\n${translations['PRODUCT_DEFINITION.Product_Description']}: {productDescription}\n\n${translations['REPORT.Process_Cell']}: {processCell}\n\n${translations['OVERVIEW.Start_Time']}: {startDate}\n${translations['OVERVIEW.End_Time']}: {endDate}\n${translations['REPORT.Duration']}: {duration.formatDuration()}[/]`;
          this.shiftFormat = `[fontSize:12px; bold]${translations['OVERVIEW.OEE']}: {oeeValue.numberFormat()}%[/]\n[fontSize:11px;]${translations['OVERVIEW.Team']}: {teamName}\n${translations['REPORT.Process_Cell']}: {processCell}\n\n${translations['OVERVIEW.Start_Time']}: {startDate}\n${translations['OVERVIEW.End_Time']}: {endDate}\n${translations['REPORT.Duration']}: {duration.formatDuration()}[/]`;
        });

  }

  ngOnDestroy(): void {
    this.root.dispose();
  }
  ngAfterViewInit(): void {
    if (this.firstLoad) {

      this.firstLoad = false;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {

    if (changes?.data?.currentValue){
      this.data = changes?.data?.currentValue;
      this.data?.forEach(el => {
        const color = (el?.oeeValue < 30) ? this.colors['danger'] : (el?.oeeValue >= 70) ? this.colors['success'] :this.colors['warning'];
        el.settings = { fill: color };
      });
    }

    if (this.root) {
      if (this.toggleValue === false || this.toggleValue === 'false') {
        this.tooltipFormat = this.shiftFormat;
      } else if (this.toggleValue === true || this.toggleValue === 'true') {
        this.tooltipFormat = this.orderFormat;
      }
      this.bubbleSeries?.set('tooltipText', this.tooltipFormat);

      if (this.startDate !== null && this.startDate !== undefined && this.endDate !== null && this.endDate !== undefined) {
        let start = new Date(this.startDate);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0);
        this.xAxis.set('min', start.getTime());

        let end = new Date(this.endDate);
        end.setDate(end.getDate() + 1);
        end.setHours(23, 59, 59);
        this.xAxis.set('max', end.getTime());
      }
      this.updateLabelIndicatorText();
      if (changes?.data?.currentValue) {
        this.bubbleSeries?.data?.setAll(this.data);
        if ((!this.data) || (this.data?.length === 0) ) {
          this.indicator.show();
          this.showInfo = false;
        } else {
          if (this.indicator) {
            this.indicator.hide();
            this.showInfo = true;
          }
        }
      }

      this.xAxis.set('start', 0.1)
      this.xAxis.remove('start')
    }
  }

  ngOnInit(): void {

    this.data.forEach(el => {
      const color = (el?.oeeValue < 30) ? this.colors['danger'] : (el?.oeeValue >= 70) ? this.colors['success'] :this.colors['warning'];
      el.settings = { fill: color };
    });
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    this.root = am5.Root.new(this.chartId);
    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);


    // this.root.dateFormatter.setAll({
    //       dateFormat: 'yyyy-MM-dd hh:mm a',
    //       dateFields: ['valueX','startDate','endDate'],
    //     });
    this.root.dateFormatter.set("intlLocales", this.lang);

    this.root.dateFormatter.setAll({
            dateFormat: { year:'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' },
            dateFields: ['startDate','endDate'],
    });

    // this.root.dateFormatter.set('dateFormat', "yyyy-MM-dd HH:mm")
    this.root.durationFormatter.set('durationFormat', "dd'd' hh'h' mm'min'")
    this.root.numberFormatter.set('numberFormat', '#.##');

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: true,
      panY: true,
      wheelY: 'zoomXY',
      pinchZoomX: true,
      pinchZoomY: true,
    }));

    // this.chart.bulletsContainer.set('paddingBottom',100);


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    this.xAxis = this.chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'minute', count: 1 },
        renderer: am5xy.AxisRendererX.new(this.root, { minGridDistance: 120,}),
        tooltip: am5.Tooltip.new(this.root, {}),
        extraMin: 0.001,
        extraMax: 0.001,
      }),
    );

    // let xRenderer = this.xAxis.get("renderer");
    // xRenderer.grid.template.setAll({
    //   location: 0.5
    // });

    this.xAxis.get("periodChangeDateFormats")["month"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("periodChangeDateFormats")["day"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("periodChangeDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("periodChangeDateFormats")["minute"] = { "hour": "numeric", "minute": "numeric" };
    this.xAxis.get("periodChangeDateFormats")["second"] = {"hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["month"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["day"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["minute"] = {"hour": "numeric", "minute": "numeric" };
    this.xAxis.get("dateFormats")["second"] = { "hour": "numeric", "minute": "numeric" };
    this.xAxis.get("tooltipDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("tooltipDateFormats")["minute"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    this.xAxis.get("tooltipDateFormats")["second"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };

    //this.xAxis.get("dateFormats")["hour"] = {hour: 'numeric', minute: 'numeric'};

    this.yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      min: 0,
      max: 100,
      extraMin: 0.001,
      extraMax: 0.001,
      numberFormat: "#'%'",
      renderer: am5xy.AxisRendererY.new(this.root, {
      }),
      tooltip: am5.Tooltip.new(this.root, {}),
    }));

    this.yAxis.get('renderer').labels.template.adapters.add('text', (text, target): string => {
      return +(text?.split('%')[0]) < 0 || +(text?.split('%')[0]) > 100 ? '' : text;
    });


    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    this.bubbleSeries = this.chart.series.push(am5xy.LineSeries.new(this.root, {
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      valueYField: 'oeeValue',
      valueXField: 'timeStampDate',
      valueField: 'oeeValue',
    }));


    this.bubbleSeries.strokes.template.set("visible", false);


    // this.bubbleSeries.chart.bulletsContainer.set('paddingBottom', 100);
    // this.bubbleSeries.chart.bulletsContainer.set('paddingTop', 100);

    this.bubbleSeries.data.processor = am5.DataProcessor.new(this.root, {
      dateFields: ["timeStampDate"], dateFormat: "yyyy-MM-dd HH:mm"
    });
    // Add bullet
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Bullets
    this.circleTemplate = am5.Template.new({ });

    this.circleTemplate.states.create("transparent", { opacity: 0.15 });

    this.circleTemplate.events.on("pointerover", (event) => {this.handleOver(event)});
    this.circleTemplate.events.on("pointerout",  (event) => {this.handleOut(event)});
    this.circleTemplate.events.on("click",  (event) => {this.handleClick(event)});


    this.tooltipFormat = this.orderFormat;

    this.bubbleSeries.bullets.push(() => {
      const bulletCircle: am5.Circle = am5.Circle.new(this.root, {
        radius: 5,
        templateField: 'settings',
        fillOpacity: 0.5,
        tooltipText: this.tooltipFormat,
        tooltip: am5.Tooltip.new(this.root, {

          getFillFromSprite: true,
          getStrokeFromSprite: true,
          autoTextColor: true,
          getLabelFillFromSprite: false,
          labelText: this.tooltipFormat,
        }),
      }, this.circleTemplate);

      // .adapters.add('background', (background, target) => {
      //   console.log('FILL', background, target)
      //   return background
      // })

      return am5.Bullet.new(this.root, {
        sprite: bulletCircle,
      });
    });

    // Add heat rule
    // https://www.amcharts.com/docs/v5/concepts/settings/heat-rules/
    this.bubbleSeries.set("heatRules", [{
      target: this.circleTemplate,
      min: 7,
      max: 7,
      dataField: "value",
      key: "radius",
    }]);

    // let tooltip = am5.Tooltip.new(this.root, {
    //   getFillFromSprite: false,
    //   getStrokeFromSprite: false,
    //   autoTextColor: false,
    //   getLabelFillFromSprite: false,
    //   labelText: this.tooltipFormat,
    // });

    // tooltip.get("background").setAll({
    //   stroke: am5.color(0x262523),
    //   fill: am5.color(0x262523),
    //   fillOpacity: 0.8,
    // });

    //this.bubbleSeries.set("tooltip", tooltip);

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    this.chart.set("cursor", am5xy.XYCursor.new(this.root, {
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      showTooltipOn: 'hover',
      //snapToSeries: [this.bubbleSeries]
    }));



    this.bubbleSeries.data.setAll(this.data);

    this.showIndicator();

    if ((!this.data) || (this.data?.length === 0) ) {
      this.indicator.show();
      this.showInfo = false;
    } else {
      if (this.indicator) {
        this.indicator.hide();
        this.showInfo = true;
      }
    }

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    this.bubbleSeries.appear(1000);
    this.chart.appear(1000, 100);
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
    } else if (( (!this.data) || (this.data?.length === 0))  && !this.isLoading  && (this.isLoading !== undefined)){
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        const text = translations["SHARED.No_Data_Available"];
        this.indicatorLabel.set("text", text)
      });
    } else {
      const text = "";
      this.indicatorLabel.set("text", text)
    }
  }


  handleOver(e) {
    var target = e.target;
    am5.array.each(this.bubbleSeries.dataItems, (dataItem: am5.DataItem<DataItem>) => {
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
    am5.array.each(this.bubbleSeries.dataItems, (dataItem: am5.DataItem<DataItem>) => {
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
      am5.array.each(this.bubbleSeries.dataItems, (dataItem: am5.DataItem<DataItem>) =>{
        var bullet = dataItem.bullets[0];
        var sprite = bullet.get('sprite');
        sprite.set('opacity', 1);
      })
      this.bubbleClick.emit(this.selectedDataItem.dataContext)
    }
    else {
      this.selectedDataItem = e.target.dataItem;
      this.bubbleClick.emit(this.selectedDataItem.dataContext)
      am5.array.each(this.bubbleSeries.dataItems, (dataItem: am5.DataItem<DataItem>) =>{
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
