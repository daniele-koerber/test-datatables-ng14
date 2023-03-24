import { Component, Input, OnInit, ViewChild, OnDestroy, AfterViewInit, Output, EventEmitter } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogRef } from '@nebular/theme';
// import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import { Subscription } from 'rxjs';
import { BaseClass } from '../../../../common/base-class/base-class';
import { IntegrationData } from '../../../../../data/integration';
import { ConfigurationData } from '../../../../../data/configuration';
import { SchedulingData } from '../../../../../data/scheduling';
import { ConfigService } from '../../../../services/config.service';

@Component({
  selector: 'ngx-report-quality-details-modal',
  styleUrls: ['./report-quality-details-modal.component.scss'],
  templateUrl: './report-quality-details-modal.component.html',
})


export class ReportQualityDetailsModalComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {

  @Input() id: any;
  @Input() chartId;

  helpLinkPage = 'report-quality-details-modal';
  helpPageLinkDestination = '#';

  isLoading
  chartDataValues: any = [];
  isFirstLoading
  // @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  data: any = [];
  lang;
  selectedProcessCell: any;
  tableHeaders: any = [];
  UoM;
  totPieces = 0;
  totProduced = 0;
  totGood = 0;
  totLost = 0;
  totRejected = 0;
  maxGood = 0;
  maxDiscarded = 0;
  goodColor;
  lostColor;
  rejectedColor
  loadSub: Subscription;

  chart: am4charts.XYChart;
  categoryAxis: am4charts.CategoryAxis<am4charts.AxisRenderer>;
  valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>;
  seriesGood: am4charts.ColumnSeries;
  seriesLost: am4charts.ColumnSeries;
  seriesRejected: am4charts.ColumnSeries;
  goodBullet: am4charts.LabelBullet;
  totalBullet: am4charts.LabelBullet;
  labelBulletLost: am4charts.LabelBullet;
  labelBulletRejected: am4charts.LabelBullet;
  indicator: any;


  constructor(
    public translate: TranslateService,
    private integrationService: IntegrationData,
    private configurationService: ConfigurationData,
    protected ref: NbDialogRef<ReportQualityDetailsModalComponent>,
    private config: ConfigService,
    private scheduleService: SchedulingData,
    private nbAuthService: NbAuthService,

  ) {
    super(nbAuthService);
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
    this.goodColor = this.config.getColor('success');
    this.lostColor = this.config.getColor('accent_3');
    this.rejectedColor = this.config.getColor('accent_4');

    this.setHelpPage();
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.waitConfigurationServiceLoaded();
  }

  closeModal() {
    this.ref.close(true);
  }

  ngAfterViewInit(): void {
    // this.dtTrigger.next();
  }

  updateData(dateStart,dateEnd) {
    this.data = [];
    const data = [];
    const includeNotReportingMachines = false;
    this.UoM = this.configurationService.getUoMByProcessCellPath(this.selectedProcessCell.path);
    this.integrationService.getProductionCountersByMachine(this.processCellPath, dateStart, dateEnd).then(productionCounters => {

      if(productionCounters && productionCounters.completedPiecesPerMachines.length > 0){
        this.scheduleService.getEmployedMachines(this.processCellPath, dateStart, dateEnd, includeNotReportingMachines).then(employedMachines=>{
          employedMachines.map((mac, index)=>{

            const macData = productionCounters.completedPiecesPerMachines.find(el => mac == el.machinePath);
            if (macData) {

              var machine = macData.machineName;
              data.push({
                  machine,
                  machineUoM: macData.machineUoM,
                  ProducedPartsMachineUoM: macData.machineProduced,
                  RejectedPartsMachineUoM: macData.machineRejected,
                  LostPartsMachineUoM: macData.machineLost,
                  SurplusPartsMachineUoM: macData.machineSurplus,
                  RejectedPartsFinalUoM: macData.finalRejected,
                  LostPartsFinalUoM: macData.finalLost,
                  ProducedPartsFinalUoM: macData.finalGood,
                  // SurplusPartsFinalUoM: macData.
              });
              this.data = data;
            }
          });
          //Sum total pieces lost & rejected
          this.totProduced = 0;
          this.totGood = 0;
          this.totLost = 0;
          this.totRejected = 0;
          this.maxDiscarded = 0;
          this.maxGood = 0;
          for (var i = 0; i < this.data.length; i++) {
            this.totProduced = this.totProduced + this.data[i].ProducedPartsFinalUoM;
            this.totLost = this.totLost + this.data[i].LostPartsFinalUoM;
            this.totRejected = this.totRejected + this.data[i].RejectedPartsFinalUoM;
            let discarded = this.data[i].LostPartsFinalUoM + this.data[i].RejectedPartsFinalUoM;
            if (discarded > this.maxDiscarded) {
              this.maxDiscarded = discarded;
            }
            if (this.data[i].ProducedPartsFinalUoM > this.maxGood) {
              this.maxGood = this.data[i].ProducedPartsFinalUoM;
            }
          }
          // this.totGood = Math.round((this.totProduced - this.totRejected) * 10) / 10
          // this.totPieces = Math.round((this.totLost + this.totRejected) * 10) / 10;
          // this.totLost = Math.round(this.totLost * 10) / 10
          // this.totRejected = Math.round(this.totRejected * 10) / 10

          this.totGood = Math.round((productionCounters.totalGoodPieciesFinalUoM) * 10) / 10
          this.totLost = Math.round(productionCounters.totalLostPieciesFinalUoM * 10) / 10
          this.totRejected = Math.round(productionCounters.totalRejectedPieciesFinalUoM * 10) / 10
          this.totPieces = Math.round((productionCounters.totalLostPieciesFinalUoM + productionCounters.totalRejectedPieciesFinalUoM) * 10) / 10;

          this.chartData();
          this.drawChart();
        });
      } else {
        this.isLoading = false;
      }
    });
    this.data = data;
  }




  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    if (!this.processCellPath) {
      this.processCellPath = this.selectedProcessCell.path
    }
    if(this.processCellPath && this.dateStart){
      this.updateData(this.dateStart,this.dateEnd);
    } else if (this.processCellPath) {
      this.scheduleService.getOrder( this.processCellPath, this.id).then(batch => {
        this.updateData(batch.timeSeriesStart,batch.timeSeriesEnd);
      });
    }
  }

  chartData() {
    const self = this;
    this.isLoading = false;

    this.data.map(el => {
      self.chartDataValues.push({
        "sector": el.machine,
        "good": (Math.round((el.ProducedPartsFinalUoM) * 10) / 10) * -1,
        "lost": Math.round(el.LostPartsFinalUoM * 10) / 10,
        "rejected": Math.round(el.RejectedPartsFinalUoM * 10) / 10,
        "totalDefect": (Math.round(el.LostPartsFinalUoM * 10) / 10) + (Math.round(el.RejectedPartsFinalUoM * 10) / 10),
      });
    })
  }

  drawChart() {
    const self = this;

    am4core.useTheme(am4themes_animated);

    this.chart = am4core.create(this.chartId, am4charts.XYChart);

    if (this.canExportData) {
      this.chart.exporting.menu = new am4core.ExportMenu();
    }

    // Use only absolute numbers
    this.chart.numberFormatter.numberFormat = "#.#s";

    // this.chartData()

    this.chart.data = this.chartDataValues;
    this.chart.paddingRight = 16;

    this.categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    this.categoryAxis.renderer.grid.template.location = 0;
    this.categoryAxis.dataFields.category = "sector";
    this.categoryAxis.renderer.minGridDistance = 1;
    this.categoryAxis.renderer.inversed = true;
    this.categoryAxis.renderer.grid.template.disabled = true;
    this.categoryAxis.renderer.labels.template.fontSize = 12;
    // this.categoryAxis.renderer.inversed = true;


    this.valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
    this.valueAxis.min = (this.maxGood + (this.maxGood * 0.05)) * -1;//add 5% to maximum to leave space for label with total good
    this.valueAxis.max = this.maxDiscarded + (this.maxDiscarded * 0.05);  //add 5% to maximum to leave space for label with total discarded
    this.valueAxis.extraMin = 0.1;
    this.valueAxis.extraMax = 0.1;


    this.seriesGood= this.chart.series.push(new am4charts.ColumnSeries());
    this.seriesGood.dataFields.categoryY = "sector";
    this.seriesGood.dataFields.valueX = "good";
    this.translate.get(["SHARED.Good"]).subscribe((translations) => {
      this.seriesGood.columns.template.tooltipText = "[bold]{values.valueX.workingValue}[regular]" + " " + translations["SHARED.Good"] + " " + this.UoM;
    });
    this.seriesGood.columns.template.strokeOpacity = 0;
    this.seriesGood.columns.template.column.cornerRadiusBottomLeft = 10;
    this.seriesGood.columns.template.column.cornerRadiusTopLeft = 10;
    this.seriesGood.stacked = true;
    this.seriesGood.columns.template.fill = am4core.color(this.goodColor);



    this.seriesLost = this.chart.series.push(new am4charts.ColumnSeries());
    this.seriesLost.dataFields.categoryY = "sector";
    this.seriesLost.dataFields.valueX = "lost";
    this.translate.get(["REPORT.Lost"]).subscribe((translations) => {
      this.seriesLost.columns.template.tooltipText = "[bold]{values.valueX.workingValue}[regular]" + " " + translations["REPORT.Lost"] + " " + this.UoM;
    });
    this.seriesLost.columns.template.strokeOpacity = 0;
    // this.seriesLost.columns.template.column.cornerRadiusBottomRight = 5;
    // this.seriesLost.columns.template.column.cornerRadiusTopRight = 5;
    this.seriesLost.stacked = true;
    this.seriesLost.columns.template.fill = am4core.color(this.lostColor);
    this.seriesLost.columns.template.column.adapter.add("cornerRadiusBottomRight", cornerRadius);
    this.seriesLost.columns.template.column.adapter.add("cornerRadiusTopRight", cornerRadius);


    this.seriesRejected = this.chart.series.push(new am4charts.ColumnSeries());
    this.seriesRejected.dataFields.categoryY = "sector";
    this.seriesRejected.dataFields.valueX = "rejected";
    this.translate.get(["SHARED.Rejected"]).subscribe((translations) => {
      this.seriesRejected.columns.template.tooltipText = "[bold]{values.valueX.workingValue}[regular]" + " " + translations["SHARED.Rejected"] + " " + this.UoM;
    });
    this.seriesRejected.columns.template.strokeOpacity = 0;
    // this.seriesRejected.columns.template.column.cornerRadiusBottomRight = 5;
    // this.seriesRejected.columns.template.column.cornerRadiusTopRight = 5;
    this.seriesRejected.stacked = true;
    this.seriesRejected.columns.template.fill = am4core.color(this.rejectedColor);
    this.seriesRejected.columns.template.column.adapter.add("cornerRadiusBottomRight", cornerRadius);
    this.seriesRejected.columns.template.column.adapter.add("cornerRadiusTopRight", cornerRadius);


    this.labelBulletLost = this.seriesLost.bullets.push(new am4charts.LabelBullet())
    this.labelBulletLost.label.horizontalCenter = "right";
    this.labelBulletLost.label.dx = -10;
    this.labelBulletLost.label.text = "{values.valueX.workingValue}";
    this.labelBulletLost.label.fill = am4core.color("#fff");
    this.labelBulletLost.label.truncate = true;
    this.labelBulletLost.label.fontSize = 12;

    // this.labelBulletLost.label.hideOversized = true;

    this.labelBulletLost.label.adapter.add("hidden", function(center, target) {
      if (!target.dataItem) {
        return center;
      }
      let values = target.dataItem.values;
      return values.valueX.value > (self.maxDiscarded * 0.15)
        ? false
        : true;
    });

    this.labelBulletRejected = this.seriesRejected.bullets.push(new am4charts.LabelBullet())
    this.labelBulletRejected.label.horizontalCenter = "right";
    this.labelBulletRejected.label.dx = -10;
    this.labelBulletRejected.label.text = "{values.valueX.workingValue}";
    this.labelBulletRejected.label.fill = am4core.color("#fff");
    this.labelBulletRejected.label.truncate = true;
    this.labelBulletRejected.label.fontSize = 12;

    // this.labelBulletRejected.label.hideOversized = true;

    this.labelBulletRejected.label.adapter.add("hidden", function(center, target) {
      if (!target.dataItem) {
        return center;
      }
      let values = target.dataItem.values;
      return values.valueX.value > (self.maxDiscarded * 0.15)
        ? false
        : true;
    });

    this.totalBullet = this.seriesRejected.bullets.push(new am4charts.LabelBullet());
    this.totalBullet.label.horizontalCenter = "left";
    this.totalBullet.label.hideOversized = false;
    this.totalBullet.label.dx = 10;
    this.totalBullet.label.text = "{totalDefect}";
    this.totalBullet.label.hideOversized = false;
    this.totalBullet.label.truncate = false;
    this.totalBullet.label.fontSize = 12;

    this.goodBullet = this.seriesGood.bullets.push(new am4charts.LabelBullet());
    this.goodBullet.label.horizontalCenter = "right";
    this.goodBullet.label.hideOversized = false;
    this.goodBullet.label.dx = -10;
    this.goodBullet.label.text = "{good}";
    this.goodBullet.label.hideOversized = false;
    this.goodBullet.label.truncate = false;
    this.goodBullet.label.fontSize = 12;


    const series = self.chart.series;

    //manage radius
    function cornerRadius(radius, item) {
      var dataItem = item.dataItem;

      // Find the last series in this stack
      var lastSeries;
      self.chart.series.each(function(series) {

        if (dataItem.dataContext[series.dataFields.valueX] && !series.isHidden && !series.isHiding) {

          lastSeries = series;
        }
      });

      return dataItem.component == lastSeries ? 10 : 0;
    }


    //Auto-adjusting chart height based on a number of data items
    let cellSize = 30; // Set cell size in pixels
    let minChartHeight = 100;
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
    this.indicator = this.chart.tooltipContainer.createChild(am4core.Container);
    this.indicator.background.fill = am4core.color("#fff");
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

  ngOnDestroy(): void {
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


  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
