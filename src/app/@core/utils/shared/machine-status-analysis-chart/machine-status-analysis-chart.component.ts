import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BaseClass } from '../../common/base-class/base-class';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { MachineStatusInMinutes } from '../../models/presentation/integration/machine-status-in-minutes';
import { ConfigService } from '../../services';
import {TranslateService} from '@ngx-translate/core';
import { MachineStatus } from '../../services/config.service';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-machine-status-analysis-chart',
  templateUrl: './machine-status-analysis-chart.component.html',
  styleUrls: ['./machine-status-analysis-chart.component.scss']
})
export class MachineStatusAnalysisChartComponent extends BaseClass implements OnInit, OnChanges {

  @Input() chartId: string;
  @Input() componentData: MachineStatusInMinutes;

  @Input() hoursToDisplay: number;

  filterData: any[];
  rawData: any[];
  root: am5.Root;
  chart: am5xy.XYChart;
  series: am5xy.ColumnSeries;
  xAxis: am5xy.ValueAxis<am5xy.AxisRenderer>;
  yAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>;
  chartData: any = '';
  categoryYField: string = 'machinePath';
  indicator: any;
  indicatorLabel: any;
  totDuration:number = 0
  oldMachinePath:string ='';

  constructor(
    private configurationService: ConfigService,
    private translate: TranslateService,
    private nbAuthService: NbAuthService
    ) {
    super(nbAuthService);
  }
  ngOnInit(): void {

  }


  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.componentData){
      this.drawChart();
      this.updateChart();
    }
  }

  updateChart(){
    if(!this.root) return;

    this.transformData();

    this.series.data.setAll(this.chartData);


    this.updateLabelIndicatorText();
    if (this.chartData.length == 0 || this.serverError) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide()
      }
    }
  }

  drawChart(){

    if (!this.componentData) {return}

    if (this.componentData.statusPerMinutes.machineOrComponentPath === this.oldMachinePath && this.root) {
      return
    } else {
      if (this.root) {
        this.root.dispose();
        this.root = null;
        this.filterData = [];
      }
    }

    this.oldMachinePath = this.componentData.statusPerMinutes.machineOrComponentPath;

    const self = this;

    this.root = am5.Root.new(this.chartId);

    this.transformData();

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      pinchZoomX: false,
      pinchZoomY: false,
      layout: this.root.verticalLayout,
      paddingTop:0,
      paddingBottom: 0,
      marginRight: 0
    }));

    let yRenderer =  am5xy.AxisRendererY.new(this.root, {});
    yRenderer.grid.template.set("visible", false);
    yRenderer.grid.template.setAll({
      forceHidden: true
    });

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    this.yAxis = this.chart.yAxes.push(am5xy.CategoryAxis.new(this.root, {
      categoryField: this.categoryYField,
      renderer: yRenderer,
      //tooltip: am5.Tooltip.new(this.root, {}),
      visible: false,
    }));

    this.yAxis.data.setAll(this.chartData);

    let xRenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 1
    });
    xRenderer.grid.template.set("visible", false);
    xRenderer.grid.template.setAll({
      forceHidden: true,
    });

    this.xAxis = this.chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
      renderer: xRenderer,
      visible: false,
      strictMinMax: true,
    }));


    this.rawData.forEach(item => {
      this.makeSeries(item.statusName,item.statusValue);
    });


    // const statusName =Object.keys(MachineStatus).filter((v) => isNaN(Number(v)));
    // const statusValue = Object.values(MachineStatus).filter((v) => !isNaN(Number(v)));;
    // statusName.forEach((key, index) => {
    //   this.makeSeries(statusName[index],statusValue[index]);
    // });


    this.chart.appear(100, 100);

    this.series.events.on("datavalidated", function() {
      self.xAxis.setAll({
        min: 0,
        max: self.totDuration,
      });
    });

    this.showIndicator();

    if (this.chartData.length == 0 || this.serverError) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide()
      }
    }
  }

  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  makeSeries(statusName,statusValue) {
    this.series = this.chart.series.push(am5xy.ColumnSeries.new(this.root, {
      valueField: statusName,
      // legendLabelText: `[fontSize: 10px; {fill} bold]${this.minutesToHm(value)}[/]
      //                   \n[fontSize: 9px]{valueField}[/]`,
      stacked: true,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      baseAxis: this.yAxis,
      valueXField: statusName,
      height: am5.percent(100),
      fill: am5.color(this.configurationService.getMachineStatusColorFromStatusValue(statusValue)),
      categoryYField: this.categoryYField,
    }));
    this.series.data.setAll(this.chartData);

  }

  transformData(){
    this.chartData = [];
    this.totDuration = 0;
    if (!this.componentData) {return}
    this.rawData = this.componentData.statusPerMinutes.statuses;
    this.rawData.forEach(item =>{
      item.duration = this.trim(item.duration,0);
      item.durationText = this.minutesToHm(item.duration);
      item.color = this.configurationService.getMachineStatusColorFromStatusValue(item.statusValue);
      this.totDuration = this.totDuration + item.duration;
    });
    this.filterData = this.rawData.filter(x => x.duration !== 0);

    let tempArray = [];
    const obj = {};
    obj[this.categoryYField] = this.machinePath;
    this.rawData.map((item) => {
      obj[item.statusName] = item.duration;
    });
    tempArray.push(obj);

    this.chartData = tempArray;
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



  minutesToHm(minutes: number): string {
    minutes = Number(minutes);
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);

    const formatH = h < 10 ? '0' + h : h;
    const formatM = m < 10 ? '0' + m : m;

    return `${formatH}:${formatM} h` ;
  }

  ngOnDestroy(): void {
    // Clean up chart when the component is removed
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }


}
