import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy';
import { ConfigurationData } from '../../../data/configuration';
import { SmoothLineChartModel } from '../../models/presentation/integration/smooth-line-chart-model';
import {TranslateService} from '@ngx-translate/core';
import { BaseClass } from '../../common/base-class/base-class';
import { ConfigService } from '../../services/config.service';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-smoothed-line-chart',
  templateUrl: './smoothed-line-chart.component.html',
  styleUrls: ['./smoothed-line-chart.component.scss']
})

export class SmoothedLineChartComponent extends BaseClass implements OnInit, OnDestroy, OnChanges {

  @Input() fill: string;
  @Input() UoM: string;
  @Input() data: SmoothLineChartModel[] = [];
  @Input() chartId: string;
  @Input() height: string = '200px';
  @Input() hideDateAxis: boolean = false;

  @Input() hoursToDisplay: number;

  root: am5.Root;
  series: any;
  indicator: any;
  hourAxis: any;
  lang = 'en'

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private translate: TranslateService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);

    const lang = config.getSelectedLanguage();
    translate.use(lang);
    this.lang = lang;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.drawChart();
    this.updateChartData();
  }

  ngOnDestroy(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.data){
      this.updateChartData();
    }
  }

  drawChart(){
    this.root = am5.Root.new(this.chartId);
    this.root.dateFormatter.set("intlLocales", this.lang);
    this.root.dateFormatter.setAll({dateFormat: { year:'numeric', month: '2-digit', "day": '2-digit',"hour": "numeric", "minute": "numeric" },dateFields: ['time'] });
    this.root.numberFormatter.set('numberFormat', '#.##');

    //Set Theme
    this.root.setThemes([
      am5.Theme.new(this.root)
    ]);

    // Create chart
    let chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: false,
      panY: false,
      wheelY: "none",
      wheelX: "none"
    }));

    let hourRenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 40
    });
    hourRenderer.grid.template.set("visible", false);
    hourRenderer.labels.template.adapters.add("text", (text, target): string => {
      return +text === 0 ? 'Now' : text + 'h';
    });
    hourRenderer.labels.template.setAll({
      fontSize: "10px",
      opacity: 0.5
    })

    let xRenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 60
    });
    xRenderer.grid.template.set("visible", false);
    xRenderer.labels.template.setAll({
      fontSize: "10px",
      opacity: 0.5
    })

    let yRenderer = am5xy.AxisRendererY.new(this.root, {});
    yRenderer.grid.template.set("visible", true);
    yRenderer.labels.template.setAll({
      fontSize: "10px",
      opacity: 0.5
    })

    // DateTime Axis
    const pcData = this.configurationService.getSelectedProcessCell();
    const numOfH = Number(pcData.areaSettings.numberOfHoursDisplayedOnOverview);
    this.hourAxis = chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
      maxDeviation: 1,
      min: -this.hoursToDisplay,
      max: 0,
      renderer: hourRenderer,
      visible: false,//this.hideDateAxis ? true : false,
      // tooltip: am5.Tooltip.new(this.root, {}),
    }));

    let dateAxis = chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: "minute", count: 1 },
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(this.root, {}),
        visible: true//this.hideDateAxis ? false : true
      })
    );
    dateAxis.get("periodChangeDateFormats")["hour"] = { "hour": "numeric", "minute": "numeric" };
    dateAxis.get("periodChangeDateFormats")["minute"] = { "hour": "numeric", "minute": "numeric" };
    dateAxis.get("periodChangeDateFormats")["second"] = {"hour": "numeric", "minute": "numeric" };
    dateAxis.get("dateFormats")["hour"] = { "hour": "numeric", "minute": "numeric" };
    dateAxis.get("dateFormats")["minute"] = {"hour": "numeric", "minute": "numeric" };
    dateAxis.get("dateFormats")["second"] = { "hour": "numeric", "minute": "numeric" };
    dateAxis.get("tooltipDateFormats")["hour"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    dateAxis.get("tooltipDateFormats")["minute"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };
    dateAxis.get("tooltipDateFormats")["second"] = { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" };



    //Value Axis
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      renderer: yRenderer,
      // min: 0,
      tooltip: am5.Tooltip.new(this.root, { }),
      // opacity: 0,
      // width: 0
    }));

    //Add series
    this.series = chart.series.push(am5xy.SmoothedXLineSeries.new(this.root, {
      xAxis: dateAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "dateTime",
      stroke: am5.color(this.fill),
    }));

    //Series tooltip
    let tooltip = am5.Tooltip.new(this.root, {
      getFillFromSprite: false,
      labelText: '{valueY.formatNumber("#.00")} ' + this.UoM,
    });
    
    tooltip.get("background").setAll({
      fill: am5.color(this.fill),
      fillOpacity: 0.6
    });
    this.series.set("tooltip", tooltip);


    //Make background gradient chart
    this.series.fills.template.set("fillGradient", am5.LinearGradient.new(this.root, {
      stops: [{
        color: am5.color(this.fill),
        opacity: 1
      }, {
        color: am5.color(0xffffff),
        opacity: 0.5
      }]
    }));


    this.series.fills.template.setAll({
      fillOpacity: 1,
      visible: true,
    });

    // const cursor = chart.set('cursor', am5xy.XYCursor.new(this.root, {
    //   behavior: 'none'
    // }));

    // Add cursor
    var cursor = am5xy.XYCursor.new(this.root, {
      xAxis: this.hourAxis,
      yAxis: yAxis,
      snapToSeries: [ this.series],
      behavior: "zoomXY",
    })
    chart.set("cursor", cursor);

    this.showIndicator();

    if ((this.data?.length == 0) || this.noData || this.isLoading) {
      this.indicator?.show()
    } else {
      if (this.indicator) {
        this.indicator?.hide()
      }
    }

  }

  updateChartData(){
    if(!this.root || !this.data) { return  }

    this.series.data.setAll(this.data);
    this.hourAxis.set('min', -this.hoursToDisplay);

    if ((this.data?.length == 0) || this.noData || this.isLoading) {
      this.indicator?.show()
    } else {
      if (this.indicator) {
        this.indicator?.hide()
      }
    }

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
    let indicatorLabel = this.indicator.children.push(am5.Label.new(this.root, {
      fontSize: 12,
      x: am5.p50,
      y: am5.p50,
      centerX: am5.p50,
      centerY: am5.p50
    }));
    if (this.serverError === true) {
      this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
        const text = translations["SHARED.Server_Error_While_Data_Loading"];
        indicatorLabel.set("text", text)
      });
    } else if (this.noData && !this.isLoading) {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        const text = translations["SHARED.No_Data_Available"];
        indicatorLabel.set("text", text)
      });
    } else {
      const text = '';
      indicatorLabel.set("text", text)
    }
  }


}
