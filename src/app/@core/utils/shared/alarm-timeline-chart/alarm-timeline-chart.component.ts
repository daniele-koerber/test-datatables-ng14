import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { DatePipe } from '@angular/common';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import { ConfigService } from '../../services/config.service';
import { BaseClass } from '../../common/base-class/base-class';

@Component({
  selector: 'ngx-alarm-timeline-chart',
  styleUrls: ['./alarm-timeline-chart.component.scss'],
  templateUrl: './alarm-timeline-chart.component.html',
})

export class AlarmsTimelineChartComponent extends BaseClass implements OnInit{

  @HostListener('window:resize', ['$event'])
  onResize() {
    setTimeout(() => {
      let chartWidth = $( '#alarmtimeline' ).width() - 100;
      let devider = Math.trunc(chartWidth / 440) ;
      let chartHeight = 180 + (Math.round((this.legendStatus.length) / devider) * 33); //3 is number of item per row, 32 is one row height
      // Get objects of interest
      // Set it on chart's container
      this.chart.svgContainer.htmlElement.style.height = chartHeight + "px";
    }, 100);
  }


  @Input() chartData;
  @Input() alarmName;
  @Input() start;
  @Input() end;

  data = [];
  legendStatus = [];
  machineName = '';
  maxTot = 0;

  serverError = false;
  chartLoading = true;

  chart: am4charts.XYChart;
  categoryAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>;
  dateAxis: am4charts.DateAxis<am4charts.AxisRenderer>
  series: am4charts.ColumnSeries;
  indicator: am4core.Container;

  lang = "en"

  chartId = "alarms-timeline-chart-id";

  helpLinkPage = 'alarms-timeline-chart';
  helpPageLinkDestination = '#';

  constructor(
    private config: ConfigService,
    protected ref: NbDialogRef<AlarmsTimelineChartComponent>,
    private translate: TranslateService,
    private nbAuthService: NbAuthService,
  ) {
      super(nbAuthService);
      const lang = config.getSelectedLanguage();
      translate.use(lang)
      this.lang = lang;
  }

  ngOnInit() {
    this.setHelpPage();
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  closeModal() {
    this.ref.close(true);
  }


  dataForChart() {
    const self = this
    const pipe = new DatePipe(this.translate.currentLang);

    var colorSet = new am4core.ColorSet();
    colorSet.saturation = 0.4;

    this.legendStatus = [];
    this.data = this.chartData;
    for(var k = 0; k < this.data.length; k++){
      this.data[k]["alarmName"] = this.alarmName
      this.data[k]["fromDateTooltip"] = pipe.transform(new Date(this.data[k].alarmStart), 'short');
      this.data[k]["toDateTooltip"] = pipe.transform(new Date(this.data[k].alarmEnd), 'short');
      this.data[k]["color"] = colorSet.getIndex(k)
      this.data[k].alarmStart = (new Date(this.data[k].alarmStart)).getTime()
      this.data[k].alarmEnd = (new Date(this.data[k].alarmEnd)).getTime()
      let legendName = ''
      this.translate.get(["REPORT.Duration","OVERVIEW.Occurred_Date_Time","OVERVIEW.End_Date_Time"]).subscribe((translations) => {
        legendName = translations["OVERVIEW.Occurred_Date_Time"]  + ": [bold]" + self.data[k].fromDateTooltip + "[regular] - " + translations["OVERVIEW.End_Date_Time"]  + ": [bold]" + self.data[k].toDateTooltip;
      });

      const legendObj = {
        name: legendName,
        fill: this.data[k].color
      }
      this.legendStatus.push(legendObj)

    }
  }

  drawChart() {
    const self = this;

    this.dataForChart()

    am4core.useTheme(am4themes_material);
    am4core.options.onlyShowOnViewport = true;

    this.chart = am4core.create(self.chartId, am4charts.XYChart);
    this.chart.data = self.data;
    this.chart.paddingRight = 20;
    this.chart.paddingTop = 30;
    this.chart.paddingBottom = 30;
    this.chart.durationFormatter.durationFormat = "hh'h' mm'min' ss's'"
    this.chart.dateFormatter.intlLocales = this.lang;
    this.chart.dateFormatter.dateFormat = { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };

    this.chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    this.chart.paddingRight = 30;
    // this.chart.dateFormatter.inputDateFormat = "yyyy-MM-ddTHH:mm:ssZ";

    this.categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    this.categoryAxis.renderer.grid.template.location = 0;
    this.categoryAxis.renderer.inversed = true;
    this.categoryAxis.dataFields.category = "alarmName";
    this.categoryAxis.renderer.minGridDistance = 10;
    this.categoryAxis.renderer.labels.template.disabled = true;

    this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    // this.dateAxis.dateFormatter.dateFormat = "yyyy-MM-ddTHH:mm:ssZ";
    this.dateAxis.dateFormats.setKey("month", { "month": "numeric", "day": "numeric", "hour": "numeric", "minute": "numeric"  });
    this.dateAxis.dateFormats.setKey("day", { "month": "numeric", "day": "numeric", "hour": "numeric", "minute": "numeric"  });
    this.dateAxis.dateFormats.setKey("hour", { "month": "numeric", "day": "numeric", "hour": "numeric", "minute": "numeric"  });
    this.dateAxis.dateFormats.setKey("minute", { "month": "numeric", "day": "numeric", "hour": "numeric", "minute": "numeric"  });
    this.dateAxis.periodChangeDateFormats.setKey("month", { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" });
    this.dateAxis.periodChangeDateFormats.setKey("day", { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" });
    this.dateAxis.periodChangeDateFormats.setKey("hour", { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" });
    this.dateAxis.periodChangeDateFormats.setKey("minute", { "month": "numeric", "day": "numeric","hour": "numeric", "minute": "numeric" });
    this.dateAxis.tooltipDateFormat = { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };

    this.dateAxis.renderer.minGridDistance = 85;
    this.dateAxis.renderer.labels.template.location = 0.5;
    this.dateAxis.startLocation = 0.5;
    this.dateAxis.endLocation = 0.5;
    this.dateAxis.renderer.paddingTop = 0;
    this.dateAxis.renderer.paddingBottom = 0;


    this.dateAxis.min = (new Date(this.start)).getTime();
    this.dateAxis.max = (new Date(this.end)).getTime();


    this.series = this.chart.series.push(new am4charts.ColumnSeries());
    this.series.columns.template.width = am4core.percent(60);

    this.translate.get(["REPORT.Duration","OVERVIEW.Occurred_Date_Time","OVERVIEW.End_Date_Time"]).subscribe((translations) => {
      self.series.columns.template.tooltipText = translations["REPORT.Duration"] + ": [bold]{duration.formatDuration()}[regular]\n"  +  translations["OVERVIEW.Occurred_Date_Time"]  +
                                                  ": [bold]{fromDateTooltip}[regular]\n" + translations["OVERVIEW.End_Date_Time"]  + ": [bold]{toDateTooltip} "

    });

    this.series.dataFields.openDateX = "alarmStart";
    this.series.dataFields.dateX = "alarmEnd";
    this.series.dataFields.categoryY = "alarmName";
    // this.series.columns.template.propertyFields.fill = "color"; // get color from data
    // this.series.columns.template.propertyFields.stroke = "color";
    this.series.columns.template.strokeOpacity = 1;

    this.series.columns.template.propertyFields.fill = "color";
    this.series.columns.template.propertyFields.stroke = "color";
    // this.series.columns.template.maxHeight = 40;

    //Cursor
    this.chart.cursor = new am4charts.XYCursor();


    //Auto-adjusting chart height based on a number of data items
    this.chart.events.on("datavalidated", (ev) => {

      let chartWidth = $( window ).width() - 100;
      let devider = Math.trunc(chartWidth / 440) ;
      let chartHeight = 180 + (Math.round((this.legendStatus.length + 1) / devider) * 33); //3 is number of item per row, 32 is one row height
      // Get objects of interest
      let chart = ev.target;

      // Set it on chart's container
      chart.svgContainer.htmlElement.style.height = chartHeight + "px";

      //Scrollbar
      self.chart.scrollbarX = new am4core.Scrollbar();

      //Export
      if (self.canExportData) {
        self.chart.exporting.menu = new am4core.ExportMenu();
        self.chart.exporting.menu.align = "left"
      }


      //Legend
      self.chart.legend = new am4charts.Legend();
      self.chart.legend.paddingTop = 10
      self.chart.legend.position = "bottom";
      let markerTemplate = self.chart.legend.markers.template;
      self.chart.legend.fontSize = 12;
      markerTemplate.width = 15;
      markerTemplate.height = 15;
      self.chart.legend.data = self.legendStatus

      self.chart.legend.itemContainers.template.events.on("toggled", function(ev) {
        self.series.columns.each(function(column) {
          const legendColor = ev.target.dataItem.dataContext["fill"];
          const colummdColor = column.fill
          const legendHexColor = legendColor["hex"]
          const colummdHexColor = colummdColor["hex"]
          if (colummdHexColor == legendHexColor) {
            if (ev.target.isActive) {
              column.hide(0);
            }
            else {
              column.show(0);
            }
          }
        })
      });
    });

    this.series.events.on("datavalidated", (ev) => {
      this.chartLoading = false;

    });

    this.showIndicator();

    if ((!this.chartData) || (this.chartData.length == 0)) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

  }

  ngOnDestroy(): void {
    // Clean up chart when the component is removed
    if (this.chart) {
      this.chart.dispose();
    }
  }

  //Show no data available in case of null data
  showIndicator() {
    this.noData = true;
    this.indicator = this.chart.tooltipContainer.createChild(am4core.Container);
    this.indicator.background.fill = am4core.color("#fff");
    this.indicator.background.fillOpacity = 1.0;
    this.indicator.width = am4core.percent(100);
    this.indicator.height = am4core.percent(100);

    let indicatorLabel = this.indicator.createChild(am4core.Label);
    if (this.serverError === true) {
      this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
        indicatorLabel.text = translations["SHARED.Server_Error_While_Data_Loading"];
      });
    } else {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        indicatorLabel.text = translations["SHARED.No_Data_Available"];
      });
    }

    indicatorLabel.align = "center";
    indicatorLabel.valign = "middle";
    indicatorLabel.fontSize = 20;
  }


}
