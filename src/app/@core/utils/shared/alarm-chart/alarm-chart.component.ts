import { Component, OnInit, AfterViewInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ConfigService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import { root } from 'rxjs/internal-compatibility';
import { BaseClass } from '../../common/base-class/base-class';
import { AlarmsTimelineChartComponent } from '../alarm-timeline-chart/alarm-timeline-chart.component';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-alarm-chart',
  templateUrl: './alarm-chart.component.html',
  styleUrls: ['./alarm-chart.component.scss']
})
export class AlarmChartComponent extends BaseClass implements OnInit, OnDestroy, OnChanges{


  @Input() chartId;
  @Input() processCell: any;
  @Input() rowNumberToShow: number = 0;
  @Input() serverError: boolean = false;
  @Input() start;
  @Input() end;
  @Input() status;

// Set data
  @Input() chartData: any = null
  series: am5xy.ColumnSeries;
  yAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>;
  root: am5.Root;


  indicator: any;
  indicatorLabel: any;
  showInfo = false;
  maxTot: number;
  seriesBulletsAlarmsChart: () => am5.Bullet;
  selectedDataItem: any;
  chart: am5xy.XYChart;
  data: any;
  valueAxis: any;
  oldMachinePath = '';
  oldProcessCellPath = '';
  firstLoad = false;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService) {
      super(nbAuthService);
    }

  ngOnInit(): void {
    // am5.ready(() => {
    //   setTimeout(() => {
    //     if (!this.chart) {
    //       this.drawChart();
    //     }
    //   }, 100);processCellPath
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (this.chart) {
    //   this.updateChartData();
    // }else {
    //   am5.ready(() => {
    //     setTimeout(() => {
    //       if (!this.chart) {
    //         this.drawChart();
    //       }
    //     }, 100);
    //   });
    // }
    if((changes.chartData || changes.noData || changes.serverError) && !this.isLoading){
      if (this.chartData) {
        if ((this.machinePath === this.oldMachinePath) && (this.processCellPath == this.oldProcessCellPath)  && this.root) {
          this.updateChartData();
        } else {
          if (this.root) {
            this.root.dispose();
            this.root = null;
          }
          // this.drawChart();

          am5.ready(() => {
            setTimeout(() => {
              this.drawChart();
            }, 100);
          });
        
        }
      }
    }
  }


  updateChartData() {
    if (!this.chart || !this.chartData) { return false; }

    let fullDataUpdate = false;
    if (!this.data) {
      this.data = this.chartData;
      fullDataUpdate = true;
    }

    let slicedChartData = this.chartData.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);
    let slicedOldData = this.data.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);

    if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
      slicedChartData = slicedChartData.slice(this.chartData.length < this.rowNumberToShow ? 0 : this.chartData.length - this.rowNumberToShow, this.chartData.length);
      slicedOldData = slicedOldData.slice(this.data.length < this.rowNumberToShow ? 0 : this.data.length - this.rowNumberToShow, this.data.length);
    }

    if (slicedOldData.length > 0 && slicedChartData.length > 0) {
      if (slicedOldData.length == slicedChartData.length) {
        for (var i = 0; i < slicedChartData.length; i++) {
          if(slicedChartData[i].duration !== slicedOldData[i].duration || slicedChartData[i].occurrences !== slicedOldData[i].occurrences ||
            slicedChartData[i].name !== slicedOldData[i].name || slicedChartData[i].machinePath !== slicedOldData[i].machinePath ||
            slicedChartData[i].alarmId !== slicedOldData[i].alarmId){
            fullDataUpdate = true;
            break;
          }
        };
      }else {
        fullDataUpdate = true;
      }
    } else {
      fullDataUpdate = true;
    }

    if(fullDataUpdate === true) {

      this.data = this.chartData;

      this.data?.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);

      if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
        this.data = this.data?.slice(this.data.length < this.rowNumberToShow ? 0 : this.data.length - this.rowNumberToShow, this.data.length);
      }
      // Update chart data
      //this.chart.data = this.data;
      this.yAxis.data.setAll(this.data);
      this.series.data.setAll(this.data);

      this.sortCategoryAxis();

      // Update label data


      var actulaMaxTot = 0
      this.data?.forEach(data => {
        if (actulaMaxTot < data?.duration) {
          actulaMaxTot = data?.duration;
        }
      });

      if (this.maxTot !== actulaMaxTot) {
        this.maxTot = actulaMaxTot
        this.valueAxis.set("max", this.maxTot + (this.maxTot * 0.30));   // add 35% to maximum to leave space for label with total discarded
      }

      this.series.columns.template.adapters.add("fill", () => { return am5.color(this.config.getColor(this.status)); });
      this.series.columns.template.adapters.add("stroke",  () => { return am5.color(this.config.getColor(this.status)); });

    }
    this.showIndicator();

    if ((!this.data) || (this.data?.length === 0) || this.noData || this.isLoading  || this.serverError) {
      this.indicator.show();
      this.series.chart.root.dom.style.height = 100 + "px";
      this.showInfo = false;
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }
    this.updateLabelIndicatorText();
  }


  drawChart(): void {
    this.root = am5.Root.new(this.chartId);

    this.oldMachinePath = this.machinePath
    this.oldProcessCellPath = this.processCellPath

  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    this.root.durationFormatter.setAll({
      baseUnit: "second",
      durationFormat: "hh'h' mm'min' ss's'",
      durationFields: ["valueX"]
    });


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      paddingTop: 50,
    }));

    // We don't want zoom-out button to appear while animating, so we hide it
    this.chart.zoomOutButton.set("forceHidden", true);


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yRenderer = am5xy.AxisRendererY.new(this.root, {
      minGridDistance: 30
    });

    this.yAxis = this.chart.yAxes.push(am5xy.CategoryAxis.new(this.root, {
      maxDeviation: 0,
      categoryField: "alarmDescription",
      renderer: yRenderer,
    }));
    this.yAxis.get("renderer").labels.template.set("fontSize", 12)

    this.valueAxis = this.chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
      maxDeviation: 0,
      min: 0,
      extraMax: 0,
      renderer: am5xy.AxisRendererX.new(this.root, {}),
      visible: false
    }));


    this.valueAxis.get("renderer").grid.template.setAll({ strokeOpacity: 0 });
    this.yAxis.get("renderer").grid.template.setAll({ strokeOpacity: 0 });

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    this.series = this.chart.series.push(am5xy.ColumnSeries.new(this.root, {
      name: "Series",
      xAxis: this.valueAxis,
      yAxis: this.yAxis,
      valueXField: "duration",
      categoryYField: "alarmDescription",
      tooltip: am5.Tooltip.new(this.root, {
        pointerOrientation: "right",
        labelText: "{valueX} - Events: {occurrences}",
      })
    }));

    // Add Label bullet
    this.series.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        locationX: 1,
        sprite: am5.Label.new(this.root, {
          text: "{valueX} - Events: {occurrences}",
          fill: am5.color(this.config.getColor('black')),
          centerY: am5.percent(50),
          centerX: am5.percent(0),
          populateText: true,
          fontSize: 12
        }),
      });
    });

    this.series.columns.template.events.on("click", (event) => { this.handleClick(event); });

    const cellSize = 40; // Set cell size in pixels
    const minChartHeight = 110;

    this.series.events.on("datavalidated",(ev) => {

      let series = ev.target;
      let chart = series.chart;
      let xAxis = chart.xAxes.getIndex(0);

      // Calculate how we need to adjust chart height
      let chartHeight = series.data.length * cellSize + xAxis.height() + chart.get("paddingTop", 0) + chart.get("paddingBottom", 0);

      // get current chart height
      const targetHeight =  chartHeight;

      // Set it on chart's container
      chart.root.dom.style.height = targetHeight + "px";
    });


    this.series.columns.template.adapters.add("fill", () => { return am5.color(this.config.getColor(this.status)); });
    this.series.columns.template.adapters.add("stroke",  () => { return am5.color(this.config.getColor(this.status)); });

    this.series.columns.template.set("height", 20)

    if (this.chartData && this.chartData.length){
      var actulaMaxTot = 0
        this.chartData?.forEach(data => {
          if (actulaMaxTot < data?.duration) {
            actulaMaxTot = data?.duration;
          }
        });

        if (this.maxTot !== actulaMaxTot) {
          this.maxTot = actulaMaxTot
          this.valueAxis.set("max", this.maxTot + (this.maxTot * 0.30));  // add 35% to maximum to leave space for label with total discarded
        }

      this.data = this.chartData;

      this.data?.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);

      if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
        this.data = this.data?.slice(this.data.length < this.rowNumberToShow ? 0 : this.data.length - this.rowNumberToShow, this.data.length);
      }
      // Update chart data
     // this.chart.data = this.data;
      this.yAxis.data.clear()
      this.series.data.clear()

      this.yAxis.data.setAll(this.data);
      this.series.data.setAll(this.data);

      this.sortCategoryAxis();
    }


  // Add globe/map switch
  const container = this.chart.children.push(am5.Container.new(this.root, {
    layout: this.root.horizontalLayout,
    centerX: am5.percent(100),
    centerY: am5.percent(0),
    x: am5.percent(100),
    y: am5.percent(0),
    paddingTop: -35,
  }));

  this.translate.get(['REPORT.Duration']).subscribe((translations) => {
    container.children.push(am5.Label.new(this.root, {
      centerY: am5.p50,
      text: translations['REPORT.Duration'],
      fontSize: 12,
    }));
  });

  const switchButton = container.children.push(
    am5.Button.new(this.root, {
      themeTags: ["switch"],
      centerY: am5.p50,
      icon: am5.Circle.new(this.root, {
        themeTags: ["icon"]
      })
    })
  );
  this.translate.get(['SHARED.Events']).subscribe((translations) => {
    container.children.push( am5.Label.new(this.root, {
      centerY: am5.p50,
      text: translations['SHARED.Events'],
      fontSize: 12,
    }));
  });

  const labelContainer = this.chart.children.push(am5.Container.new(this.root, {
    layout: this.root.horizontalLayout,
    centerX: am5.percent(100),
    centerY: am5.percent(0),
    x: am5.percent(100),
    y: am5.percent(0),
    paddingTop: -60,
    paddingRight: 22,
  }));

  this.translate.get(['SHARED.Alarm_sorting']).subscribe((translations) => {
    labelContainer.children.push(am5.Label.new(this.root, {
      centerY: am5.p50,
      text: translations['SHARED.Alarm_sorting'],
      fontSize: 14,
    }));
  });


  this.translate.get(['SHARED.Alarm_sorting']).subscribe((translations) => {
    //switchLabel.text = translations['SHARED.Alarm_sorting'];
    //switchButton.get()
  });

  switchButton.on("active", () => {
    if (switchButton.get("active")) {
      let sortedData = this.chartData.sort((firstItem, secondItem) => firstItem.occurrences - secondItem.occurrences);

      if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
        sortedData = sortedData?.slice(sortedData.length - this.rowNumberToShow, sortedData.length);
      }
      this.data = sortedData;
      this.yAxis.data.setAll(this.data);
      this.series.data.setAll(this.data);
    } else {
      let sortedData = this.chartData.sort((firstItem, secondItem) => firstItem.duration - secondItem.duration);
      if (this.rowNumberToShow > 0 && this.rowNumberToShow !== null) {
        sortedData = sortedData?.slice(sortedData.length - this.rowNumberToShow, sortedData.length);
      }
      this.data = sortedData;
      this.yAxis.data.setAll(this.data);
      this.series.data.setAll(this.data);
    }
  });



    if (this.canExportData) {
      const exporting = am5plugins_exporting.Exporting.new(this.root, {
          menu: am5plugins_exporting.ExportingMenu.new(this.root, {}),
          dataSource: this.chartData,
      });
    }

    var cursor =  this.chart.set("cursor", am5xy.XYCursor.new(this.root, {
      behavior: "none",
      xAxis: this.valueAxis,
      yAxis: this.yAxis
    }));

    cursor.lineX.setAll({ visible: false });
    cursor.lineY.setAll({ visible: false });


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    this.series.appear(1000);
    this.chart.appear(1000, 100);

    this.updateChartData();
  }

// Axis sorting
  sortCategoryAxis() {

  // Sort by value
  this.series.dataItems.sort((x, y) => {
    return x.get("valueX") - y.get("valueX"); // descending
    //return y.get("valueY") - x.get("valueX"); // ascending
  })

  // Go through each axis item
  am5.array.each(this.yAxis.dataItems, (dataItem) => {
    // get corresponding series item
    var seriesDataItem = this.getSeriesItem(dataItem.get("category"));

    if (seriesDataItem) {
      // get index of series data item
      var index = this.series.dataItems.indexOf(seriesDataItem);
      // calculate delta position
      var deltaPosition = (index - dataItem.get("index", 0)) / this.series.dataItems.length;
      // set index to be the same as series data item index
      dataItem.set("index", index);
      // set deltaPosition instanlty
      dataItem.set("deltaPosition", -deltaPosition);
      // animate delta position to 0
      dataItem.animate({
        key: "deltaPosition",
        to: 0,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic)
      })
    }
  });

  // Sort axis items by index.
  // This changes the order instantly, but as deltaPosition is set,
  // they keep in the same places and then animate to true positions.
  this.yAxis.dataItems.sort((x, y) => {
    return x.get("index") - y.get("index");
  });
}

  // Get series item by category
  getSeriesItem(category): am5.DataItem<am5xy.IColumnSeriesDataItem> {
    for (var i = 0; i < this.series.dataItems.length; i++) {
      var dataItem = this.series.dataItems[i];
      if (dataItem.get("categoryY") == category) {
        return dataItem;
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

  handleClick(e) {
    if (this.selectedDataItem == e.target.dataItem.dataContext) {
      const alarmName = this.selectedDataItem?.alarmDescription;
      const occurrencesList = this.selectedDataItem?.occurrencesList;
      if (occurrencesList) {
        this.openAlarmTimelineChart(occurrencesList, alarmName);
      }
    }
    else {
      this.selectedDataItem = e.target.dataItem.dataContext;
      const alarmName = this.selectedDataItem?.alarmDescription;
      const occurrencesList = this.selectedDataItem?.occurrencesList;
      if (occurrencesList) {
        this.openAlarmTimelineChart(occurrencesList, alarmName);
      }
    }
  }

  openAlarmTimelineChart(chartData, alarmName) {
    const obj = {
      chartData: chartData,
      alarmName: alarmName,
      start : this.start,
      end : this.end,
    };
    const ref = this.dialogService.open(AlarmsTimelineChartComponent, {
      context: obj as Partial<AlarmsTimelineChartComponent>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {

    });
  }

  ngOnDestroy(): void {
    // Clean up chart when the component is removed
      if (this.root) {
        this.root.dispose();
      }
    }

}



