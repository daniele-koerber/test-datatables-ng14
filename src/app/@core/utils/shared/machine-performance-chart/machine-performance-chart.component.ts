import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IntegrationData } from '../../../../@core/data/integration';
import { NbDialogService } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import {TranslateService} from '@ngx-translate/core';
import { SchedulingData } from '../../../data/scheduling';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_material from "@amcharts/amcharts4/themes/material";

import { Subscription } from 'rxjs';
import { BaseClass } from '../../common/base-class/base-class';

@Component({
  selector: 'ngx-machine-performance-chart',
  styleUrls: ['./machine-performance-chart.component.scss'],
  templateUrl: './machine-performance-chart.component.html',
})

export class MachinePerformanceComponent extends BaseClass implements OnInit {


  @Input() id;


  chartId = 'machinePerformanceChart';
  selectedProcessCell: any;
  data = [];
  reasonArray = [];

  isFirstLoading = false;
  serverError = false;

  maxTot = 0;
  UoM = '';

  chart: am4charts.XYChart;
  categoryAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>;
  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;
  indicator: am4core.Container;

  pcSub: Subscription;
  loadSub: Subscription;

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private translate: TranslateService,
    private scheduleService: SchedulingData,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService,

  ) {
    super(nbAuthService);
  }

  ngOnInit() {
    this.isLoading = true;
    this.isFirstLoading = true;

  }

  ngAfterViewInit(): void {
    this.waitConfigurationServiceLoaded();
  }


  updateTargetProcessCellData() {
    this.serverError = false;
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    const pc = (this.processCellPath ? this.processCellPath : this.selectedProcessCell.path);
    this.UoM = this.configurationService.getUoMByProcessCellPath(pc);
    if(pc && this.dateStart){
      this.integrationService.getPerformanceMachinesByProcessCellPath(pc, this.dateStart, this.dateEnd).then((res) => {
        this.data = res.response;
        this.drawChart();
      }).catch(error => {
        this.updateWithServerError()
      });
  } else if(pc && this.id){
      this.scheduleService.getOrder(pc, this.id).then(batch => {
        this.integrationService.getPerformanceMachinesByProcessCellPath(pc, batch.timeSeriesStart, batch.timeSeriesEnd).then((res) => {
          this.data = res.response;
          this.drawChart();
        }).catch(error => {
          this.updateWithServerError()
        });
      }).catch(error => {
        this.updateWithServerError()
      });
    }
  }



  dataForChart() {
    this.maxTot = 0;
    this.data.reverse();
    for(var i = 0; i < this.data.length; i++){
      //round values
      this.data[i].producedParts = Math.round(this.data[i].producedParts * 10.0) / 10.0
      this.data[i].idealProducedParts = Math.round(this.data[i].idealProducedParts * 10.0) / 10.0
      this.data[i].productionDecifit = Math.round(this.data[i].productionDecifit * 10.0) / 10.0
      //find max value
      if (this.maxTot < this.data[i].producedParts) {
        this.maxTot = this.data[i].producedParts;
      }
      if (this.maxTot < this.data[i].idealProducedParts) {
        this.maxTot = this.data[i].idealProducedParts;
      }
      if (this.maxTot < this.data[i].productionDecifit) {
        this.maxTot = this.data[i].productionDecifit;
      }
    }

  }

  updateWithServerError() {
    this.serverError = true;
    this.data = [];
    this.drawChart();
  }


  drawChart() {
    const self = this;
    this.isLoading = false;
    this.loadingFinished.emit(true);

    this.dataForChart()

    am4core.useTheme(am4themes_material);

    this.chart = am4core.create(self.chartId, am4charts.XYChart);

    // Use only absolute numbers
    this.chart.numberFormatter.numberFormat = "#.#s";

    if (this.canExportData) {
      this.chart.exporting.menu = new am4core.ExportMenu();
    }

    this.chart.data = self.data;
    this.chart.paddingRight = 20;
    this.chart.paddingTop = 30;
    this.chart.paddingBottom = 30;
    this.chart.durationFormatter.durationFormat = "hh'h' mm'min' ss's'"

    var categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "machineName";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.cellStartLocation = 0.05;
    categoryAxis.renderer.cellEndLocation = 0.95;
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.grid.template.disabled = true;


    var  valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = this.maxTot + (this.maxTot * 0.1);  //add 10% to maximum to leave space for label with total discarded
    valueAxis.title.text = this.UoM

  //Production deficit
    let producetionDeficitText = '';
    this.translate.get(["COMMON.Production_deficit"]).subscribe((translations) => {
      producetionDeficitText = translations["COMMON.Production_deficit"];
    });
    //Series
    var seriesProductionDeficit = self.chart.series.push(new am4charts.ColumnSeries());
    seriesProductionDeficit.dataFields.valueX = "productionDecifit";
    seriesProductionDeficit.dataFields.categoryY = "machineName";
    seriesProductionDeficit.name = producetionDeficitText;
    seriesProductionDeficit.columns.template.tooltipText = "{name}: [bold]{values.valueX.workingValue}" + this.UoM;
    seriesProductionDeficit.stacked = false;
    // seriesProductionDeficit.columns.template.height = 20;
    seriesProductionDeficit.columns.template.fill = am4core.color(this.config.getColor('accent_3'));
    seriesProductionDeficit.columns.template.stroke = am4core.color(this.config.getColor('accent_3'));
    seriesProductionDeficit.columns.template.column.cornerRadiusTopRight = 10;
    seriesProductionDeficit.columns.template.column.cornerRadiusBottomRight = 10;

    //Label
    var labelProductionDeficit = seriesProductionDeficit.bullets.push(new am4charts.LabelBullet())
    labelProductionDeficit.label.horizontalCenter = "left";
    labelProductionDeficit.label.dx = 10;
    labelProductionDeficit.label.text = '{valueX}';
    labelProductionDeficit.label.hideOversized = false;
    labelProductionDeficit.label.truncate = false;
    labelProductionDeficit.label.fontSize = 12;
    labelProductionDeficit.label.fill = am4core.color('#000000')

//Produced part
    let producedPartText = '';
    this.translate.get(["COMMON.Quantity_produced"]).subscribe((translations) => {
      producedPartText = translations["COMMON.Quantity_produced"];
    });
    //Series
    var seriesProducedPart = self.chart.series.push(new am4charts.ColumnSeries());
    seriesProducedPart.dataFields.valueX = "producedParts";
    seriesProducedPart.dataFields.categoryY = "machineName";
    seriesProducedPart.name = producedPartText;
    seriesProducedPart.columns.template.tooltipText = "{name}: [bold]{values.valueX.workingValue} " + this.UoM;
    seriesProducedPart.stacked = false;
    // seriesProducedPart.columns.template.height = 20;
    seriesProducedPart.columns.template.fill = am4core.color(this.config.getColor('success'));
    seriesProducedPart.columns.template.stroke = am4core.color(this.config.getColor('success'));
    seriesProducedPart.columns.template.column.cornerRadiusTopRight = 10;
    seriesProducedPart.columns.template.column.cornerRadiusBottomRight = 10;
    //Label
    var labelProducedPart = seriesProducedPart.bullets.push(new am4charts.LabelBullet())
    labelProducedPart.label.horizontalCenter = "left";
    labelProducedPart.label.dx = 10;
    labelProducedPart.label.text = '{valueX}';
    labelProducedPart.label.hideOversized = false;
    labelProducedPart.label.truncate = false;
    labelProducedPart.label.fontSize = 12;
    labelProducedPart.label.fill = am4core.color('#000000')

  //Ideal part
    let idelPartText = '';
    this.translate.get(["COMMON.Ideal_pieces"]).subscribe((translations) => {
      idelPartText = translations["COMMON.Ideal_pieces"];
    });
    //Series
    var seriesIdealPart = self.chart.series.push(new am4charts.ColumnSeries());
    seriesIdealPart.dataFields.valueX = "idealProducedParts";
    seriesIdealPart.dataFields.categoryY = "machineName";
    seriesIdealPart.name = idelPartText;
    seriesIdealPart.columns.template.tooltipText = "{name}: [bold]{values.valueX.workingValue} " + this.UoM;
    seriesIdealPart.stacked = false;
    // seriesIdealPart.columns.template.height = 20;
    seriesIdealPart.columns.template.fill = am4core.color(this.config.getColor('primary'));
    seriesIdealPart.columns.template.stroke = am4core.color(this.config.getColor('primary'));
    seriesIdealPart.columns.template.column.cornerRadiusTopRight = 10;
    seriesIdealPart.columns.template.column.cornerRadiusBottomRight = 10;

    //Label
    var labelIdealPart = seriesIdealPart.bullets.push(new am4charts.LabelBullet())
    labelIdealPart.label.horizontalCenter = "left";
    labelIdealPart.label.dx = 10;
    labelIdealPart.label.text = '{valueX}';
    labelIdealPart.label.hideOversized = false;
    labelIdealPart.label.truncate = false;
    labelIdealPart.label.fontSize = 12;
    labelIdealPart.label.fill = am4core.color('#000000')


    //Legend
    this.chart.legend = new am4charts.Legend();
    this.chart.legend.reverseOrder = true;
    this.chart.legend.paddingTop = 10
    this.chart.legend.position = "bottom";
    let markerTemplate = this.chart.legend.markers.template;
    // this.chart.legend.fontSize = 12;
    markerTemplate.width = 13;
    markerTemplate.height = 13;


    //Auto-adjusting chart height based on a number of data items
    let cellSize = 50; // Set cell size in pixels
    let minChartHeight = 200;
    this.chart.events.on("datavalidated", function(ev) {

      // Get objects of interest
      let chart = ev.target;
      let categoryAxis = chart.yAxes.getIndex(0);

      // Calculate how we need to adjust chart height
      let adjustHeight = chart.data.length * cellSize;

      // get current chart height
      let targetHeight = minChartHeight + adjustHeight;

      // Set it on chart's container
      chart.svgContainer.htmlElement.style.height = targetHeight + "px";
    });


  this.showIndicator();

  if ((!this.data) || (this.data.length == 0) || (!this.UoM)) {
    this.indicator.show();
  } else {
    if (this.indicator) {
      this.indicator.hide();
    }
  }

}

  //Show no data available in case of null data
  showIndicator() {
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

  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    // Clean up chart when the component is removed
    if (this.chart) {
      this.chart.dispose();
    }
  }

  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        if (this.chart) {
          this.chart.dispose();
          if (this.indicator) {
            this.indicator = null;
          }
          this.drawChart()
        }
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
