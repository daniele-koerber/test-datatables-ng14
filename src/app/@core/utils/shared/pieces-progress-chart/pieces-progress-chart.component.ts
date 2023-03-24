import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ConfigService } from '../../services/config.service';
import { AlarmsTimelineChartComponent } from '../alarm-timeline-chart/alarm-timeline-chart.component';

@Component({
  selector: 'ngx-pieces-progress-chart',
  styleUrls: ['./pieces-progress-chart.component.scss'],
  templateUrl: './pieces-progress-chart.component.html',
})

export class PiecesProgressChartComponent implements OnInit, OnChanges{

  @Input() targetPieces: number = 0;
  @Input() goodPieces: number = 0;
  @Input() performancePercentage: number = 0;

  data: {
    category: string;
    from: number;
    to: number;
    name: string;
    columnSettings: {
        fill: am5.Color;
        opacity: number;
    };
  }[]

  root: am5.Root
  chart: am5xy.XYChart
  series: am5xy.ColumnSeries
  xAxis: any;
  goodRangeDataItem: any;
  targetRangeDataItem:any;
  chartId = "pieces-progress-chart-id";
  targetPiecesString:string = ''
  goodPiecesString:string = ''

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private authService: NbAuthService,
  ) {
    this.translate.get(["CALENDAR.Target_Quantity","SHARED.Total_pieces_good"]).subscribe((translations) => {
      this.targetPiecesString = translations["CALENDAR.Target_Quantity"];
      this.goodPiecesString = translations["SHARED.Total_pieces_good"];
    });

   }

  ngOnInit() {
  }


  ngAfterViewInit(): void {
    this.drawChart();
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateChartData();

    // if (changes?.targetPieces?.currentValue || changes?.goodPieces?.currentValue || changes?.performancePercentage?.currentValue){
    //   this.updateChartData();
    // }
  }

  updateChartData() {

    var color = this.config.getColor('grey_2');
    if  ((this.performancePercentage < 30) && !(this.performancePercentage == null)) {
      color = this.config.getColor('error')
    } else if  (this.performancePercentage >= 70) {
      color = this.config.getColor('success')
    } else if  ((this.performancePercentage >= 30) && (this.performancePercentage < 70)) {
      color = this.config.getColor('accent_1')
    }

    this.data = [{
      category: "",
      from: 0,
      to: this.goodPieces,
      name: this.targetPiecesString,
      columnSettings: {
        fill: am5.color(color),
        opacity: 1
      }
    }, {
      category: "",
      from: this.goodPieces,
      to: this.targetPieces,
      name: this.goodPiecesString,
      columnSettings: {
        fill: am5.color(color),
        opacity: 0.5
      }
    }
    ];
    // if (this.xAxis) {
    //   this.xAxis.setAll({
    //     max: this.xAxis.getPrivate("max")
    //   });
    // }

    if (this.series) {
      this.series.data.setAll(this.data);

      this.goodRangeDataItem.setAll({
        value : this.goodPieces
      })
      this.goodRangeDataItem.get("label").setAll({
        text: String(this.goodPieces)
      });

      this.targetRangeDataItem.setAll({
        value : this.targetPieces
      })
      this.targetRangeDataItem.get("label").setAll({
        text: String(this.targetPieces)
      });
    }



  }

  drawChart() {
    this.root = am5.Root.new(this.chartId);


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
      layout: this.root.verticalLayout,
      paddingLeft:10,
      paddingRight:30,
    }));


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let yAxis = this.chart.yAxes.push(am5xy.CategoryAxis.new(this.root, {
      categoryField: "category",
      renderer: am5xy.AxisRendererY.new(this.root, {
        forceHidden: true
      })
    }));
    yAxis.data.setAll([{ category: "" }]);
    let yRenderer = yAxis.get("renderer");
    yRenderer.grid.template.setAll({
      forceHidden: true
    });


    this.xAxis = this.chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
      min: 0,
      numberFormat: "#",
      renderer: am5xy.AxisRendererX.new(this.root, {
        forceHidden: true,
        minGridDistance: 1,
      })
    }));

    this.xAxis.get("renderer").labels.template.set("forceHidden", true);

    let xRenderer = this.xAxis.get("renderer");
    xRenderer.grid.template.setAll({
      forceHidden: true
    });


    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    this.series = this.chart.series.push(am5xy.ColumnSeries.new(this.root, {
      xAxis: this.xAxis,
      yAxis: yAxis,
      valueXField: "to",
      openValueXField: "from",
      categoryYField: "category",
      categoryXField: "name"
    }));

    this.series.columns.template.setAll({
      strokeWidth: 0,
      strokeOpacity: 0,
      height: am5.percent(100),
      templateField: "columnSettings"
    });
    this.series.data.setAll(this.data);

    //Range good
    this.goodRangeDataItem = this.xAxis.makeDataItem({
      value: this.goodPieces
    });
    let goodRange = this.xAxis.createAxisRange(this.goodRangeDataItem);

    this.goodRangeDataItem.get("grid").set("forceHidden", true);

    this.goodRangeDataItem.get("tick").setAll({
      visible: true,
      length: 18,
      strokeOpacity: 0.2
    });

    this.goodRangeDataItem.get("label").setAll({
      centerX: am5.p100,
      forceHidden: false,
      fontSize: 10,
    });

    //Range target
    this.targetRangeDataItem = this.xAxis.makeDataItem({
      value: this.targetPieces
    });
    let targetRange = this.xAxis.createAxisRange(this.targetRangeDataItem);

    this.targetRangeDataItem.get("grid").set("forceHidden", true);

    this.targetRangeDataItem.get("tick").setAll({
      visible: true,
      length: 18,
      strokeOpacity: 0.2
    });

    this.targetRangeDataItem.get("label").setAll({
      centerX: am5.p0,
      forceHidden: false,
      fontSize: 10,
      fontWeight: "800",
    });


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    this.series.appear();
    this.chart.appear(1000, 100);

  }


  ngOnDestroy(): void {
    // Clean up chart when the component is removed
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }



}
