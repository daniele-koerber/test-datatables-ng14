import { Component, Input, OnChanges, SimpleChanges, OnInit , Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigService } from '../../services/config.service';
import { ConfigurationData } from '../../../data/configuration';
import { SchedulingData } from '../../../data/scheduling';
import { IntegrationData } from '../../../data/integration';
import { Subscription } from 'rxjs';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { BaseClass } from '../../common/base-class/base-class';


@Component({
  selector: 'ngx-machine-oee-chart',
  styleUrls: ['./machine-oee-chart.component.scss'],
  templateUrl: './machine-oee-chart.component.html',
})

export class MachineOeeChartComponent extends BaseClass implements OnInit, OnChanges {

  @Input() from: Date;
  @Input() to: Date;
  @Input() id: number;
  @Input() processCell: number;
  @Input() numberOfHoursDisplayedOnOverview;
  selectedProcessCell: any;

  colorsArray = [];

  chartDataValues = [];
  UoM = ''

  pcSub: Subscription;
  loadSub: Subscription;

  chart: am4charts.XYChart;
  chartId = "machineOEEchartId"
  indicator: any;

  constructor(
    private scheduleService: SchedulingData,
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);
    am4core.useTheme(am4themes_animated);

    this.colorsArray = [
      { min: 0, max: 30, color: this.config.getColor('error') },
      { min: 30, max: 70, color: this.config.getColor('accent_2') },
      { min: 70, max: 100, color: this.config.getColor('success') },
    ];
  }

  ngOnInit() {
    this.isLoading = true;
    this.waitConfigurationServiceLoaded();

  }

  ngOnChanges(changes: SimpleChanges) {

  }


  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    const pc = (this.processCell ? this.processCell : this.selectedProcessCell);
    if(this.from) {
      this.updateChartData(this.from, this.to)

    } else {
      this.updateChartData(null, null)
    }
  }


  updateChartData(dateFrom, dateTo) {
    const self = this;
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    const pc = (this.processCell ? this.processCell : this.selectedProcessCell);
    let pcData = this.configurationService.getSelectedProcessCell();
    if (pc) {
      this.UoM = this.configurationService.getUoMByProcessCellPath(pc);
      this.integrationService.getMachinesOEEData(pc, dateFrom, dateTo, this.numberOfHoursDisplayedOnOverview,this.isShift).then((res) => {
         res.response.forEach(item => {
          let obj = {
            machineName: item.machineName,
            UoM: item.oee.uoM,
            qualityPercentage: item.oee.resultQualityPercentage,
            availabilityPercentage: item.oee.resultAvailabilityPercentage,
            performancePercentage: item.oee.resultPerformancePercentage,
            oeeValue: item.oee.resultOverallPercentage,
            productionTime: item.oee.plannedProductionTime,
            operatingTime: item.oee.operatingTime,
            dowtimeTime: item.oee.plannedProductionTime > item.oee.operatingTime ? item.oee.plannedProductionTime - item.oee.operatingTime : 0,
            idealPieces: item.oee.idealPieces,
            quantityProduced: item.oee.totalPieces,
            quantityDeficit: item.oee.idealPieces > item.oee.totalPieces ? item.oee.idealPieces - item.oee.totalPieces: 0,
            totalPieces: item.oee.totalPieces,
            goodPieces: item.oee.goodPieces,
            defectivePieces: item.oee.totalPieces > item.oee.goodPieces ? item.oee.totalPieces - item.oee.goodPieces: 0,
          }
          this.chartDataValues.push(obj)
        });
        this.drawChart();
        this.isLoading = false;
        this.loadingFinished.emit(true);
      })
    }
  }

  drawChart() {
    const self = this

    this.chart = am4core.create(this.chartId, am4charts.XYChart);
    this.chart.durationFormatter.durationFormat = "hh'h' mm'min' ss's'"

    if (this.canExportData) {
      this.chart.exporting.menu = new am4core.ExportMenu();
    }

    this.chartDataValues.reverse();
    this.chart.data = this.chartDataValues;
    this.chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    this.chart.zoomOutButton.disabled = true;

    let categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'machineName';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.tooltip.disabled = true;
    categoryAxis.renderer.cellStartLocation = 0.2;
    categoryAxis.renderer.cellEndLocation = 0.8;
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 110;
    valueAxis.renderer.minGridDistance = 10;
    valueAxis.renderer.labels.template.adapter.add('text',(text) => {
      if (+text <= 100){
        return text + ' %';
      } else {
        return '';
      }

    });

    this.translate.get(['OVERVIEW.OEE']).subscribe((translations) => {
      valueAxis.title.text = translations['OVERVIEW.OEE'] + ' %';
    });
    valueAxis.cursorTooltipEnabled = false;

    valueAxis.renderer.gridContainer.zIndex = 1;

    let qualityTooltip = ''
    let qualityName = ''
    this.translate.get(['OVERVIEW.Quality','COMMON.Total_pieces','COMMON.Good_Pieces','COMMON.Defective']).subscribe((translations) => {
      qualityName = translations['OVERVIEW.Quality'];
      qualityTooltip = translations['OVERVIEW.Quality'] + ': [bold]{qualityPercentage.formatNumber("#.0")}' + '%\n[regular]' +
                        translations['COMMON.Total_pieces'] + ': {totalPieces.formatNumber("#.0")} {UoM}\n' +
                        translations['COMMON.Good_Pieces'] + ': {goodPieces.formatNumber("#.0")} {UoM}\n' +
                        translations['COMMON.Defective'] + ': {defectivePieces.formatNumber("#.0")} {UoM}';
    });
    let performanceTooltip = ''
    let performanceName = ''
    this.translate.get(['OVERVIEW.Performance','COMMON.Ideal_pieces','COMMON.Quantity_produced','COMMON.Production_deficit']).subscribe((translations) => {
      performanceName = translations['OVERVIEW.Performance'];
      performanceTooltip = translations['OVERVIEW.Performance'] + ': [bold]{performancePercentage.formatNumber("#.0")}' + '%\n[regular]' +
                        translations['COMMON.Ideal_pieces'] + ': {idealPieces.formatNumber("#.0")} {UoM}\n' +
                        translations['COMMON.Quantity_produced'] + ': {quantityProduced.formatNumber("#.0")} {UoM}\n' +
                        translations['COMMON.Production_deficit'] + ': {quantityDeficit.formatNumber("#.0")} {UoM}';
    });
    let availabilityTooltip = ''
    let availabilityName = ''
    this.translate.get(['OVERVIEW.Availability','COMMON.Production_time','COMMON.Operating_time','COMMON.Down_time']).subscribe((translations) => {
      availabilityName = translations['OVERVIEW.Availability'];
      availabilityTooltip = translations['OVERVIEW.Availability'] + ': [bold]{availabilityPercentage.formatNumber("#.0")}' + '%\n[regular]' +
                        translations['COMMON.Production_time'] + ': {productionTime.formatDuration()}\n' +
                        translations['COMMON.Operating_time'] + ': {operatingTime.formatDuration()}\n' +
                        translations['COMMON.Down_time'] + ': {dowtimeTime.formatDuration()}';
    });

    let OEETooltip = ''
    let OEEName = ''
    this.translate.get(['OVERVIEW.OEE']).subscribe((translations) => {
      OEEName = translations['OVERVIEW.OEE'];
      OEETooltip = translations['OVERVIEW.OEE'] + ': [bold]{oeeValue.formatNumber("#.0")}' + '%';
    });

    this.createSeries('qualityPercentage', 'machineName',qualityName, qualityTooltip, this.config.getColor('success'))
    this.createSeries('performancePercentage', 'machineName',performanceName, performanceTooltip, this.config.getColor('primary'))
    this.createSeries('availabilityPercentage', 'machineName',availabilityName, availabilityTooltip, this.config.getColor('error'))
    this.createSeries('oeeValue', 'machineName',OEEName, OEETooltip, this.config.getColor('accent_2'))

    //Auto-adjusting chart height based on a number of data items
    let cellSize = 120; // Set cell size in pixels
    let minChartHeight = 50;
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

    //Legend
    this.chart.legend = new am4charts.Legend();
    this.chart.legend.reverseOrder = true;
    this.chart.legend.paddingTop = 10
    this.chart.legend.position = "bottom";
    let markerTemplate = this.chart.legend.markers.template;
    // this.chart.legend.fontSize = 12;
    markerTemplate.width = 13;
    markerTemplate.height = 13;

    this.showIndicator()

    if ((!this.chartDataValues) || (this.chartDataValues.length == 0)) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide();
      }
    }

  }

  //Show no data available in case of null data
  showIndicator() {
    this.noData = true;
    this.indicator = this.chart.tooltipContainer.createChild(am4core.Container);
    this.indicator.background.fill = am4core.color('#fff');
    this.indicator.background.fillOpacity = 1.0;
    this.indicator.width = am4core.percent(100);
    this.indicator.height = am4core.percent(100);

    let indicatorLabel = this.indicator.createChild(am4core.Label);

    this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
      indicatorLabel.text = translations["SHARED.No_Data_Available"];
    });
    indicatorLabel.align = "center";
    indicatorLabel.valign = "middle";
    indicatorLabel.fontSize = 20;
  }

   // Create series
 createSeries(field, name, seriesName, tooltipText, color) {


    const series = this.chart.series.push(new am4charts.ColumnSeries);
    series.dataFields.valueX = field;
    series.dataFields.categoryY = name;
    series.name = seriesName;

    series.columns.template.tooltipText = tooltipText;//tooltipName + ': ' + '[bold]{values.valueX.workingValue.formatNumber("#.#")}' + '%';

    series.tooltipPosition = "pointer";

    series.columns.template.fill = color;
    series.columns.template.stroke = color;

    const columnTemplate = series.columns.template;
    columnTemplate.width = 30;
    columnTemplate.column.cornerRadiusTopRight = 20;
    columnTemplate.column.cornerRadiusBottomRight = 20;
    columnTemplate.strokeOpacity = 0;


    //Label
    var labelIdealPart = series.bullets.push(new am4charts.LabelBullet())
    labelIdealPart.label.horizontalCenter = "left";
    labelIdealPart.label.dx = 10;
    labelIdealPart.label.text = '{values.valueX.workingValue.formatNumber("#.0")}' + '%';;
    labelIdealPart.label.hideOversized = false;
    labelIdealPart.label.truncate = false;
    labelIdealPart.label.fontSize = 12;
    labelIdealPart.label.fill = am4core.color('#000000')

}


  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
   }

  /**
   * LISTENERS
   */

  waitConfigurationServiceLoaded() {
    this.pcSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

  listenForSelectedProcessCellChanges() {
    this.loadSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.isLoading = true;
        this.updateTargetProcessCellData();
      }
    });
  }

}
