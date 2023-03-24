import { Component, OnInit, Input, Output, EventEmitter,OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import { ConfigService } from '../../../../@core/utils/services/config.service';
import { MachineDataDetailsComponent } from '../../../../@core/utils/shared/line-status-chart/machine-data-details/machine-data-details.component';
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5xy from "@amcharts/amcharts5/xy";
import { LineStatus_FE } from '../../models/presentation/integration/line-status';
import { BaseClass } from '../../common/base-class/base-class';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-line-status-chart',
  styleUrls: ['./line-status-chart.component.scss'],
  templateUrl: './line-status-chart.component.html',
})

export class LineStatusChartComponent extends BaseClass implements OnInit, OnChanges {

  @Input() detailsOpen: boolean;
  @Input() rawDataChart: LineStatus_FE;

  fullDataUpdate: boolean = true;
  bubbleSizePerc: number;
  series: am5hierarchy.ForceDirected
  container: am5.Container
  root: am5.Root
  indicator: am5.Label;
  indicatorLabel: am5.Label

  chartId: string = 'lineStatuschartId';
  chartData = [{
    children : []
  }];
  oldChartData = []

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    const lang = config.getSelectedLanguage();
    translate.use(lang)
  }

  ngOnInit() {
    this.fullDataUpdate = true;
  }

  ngAfterViewInit(): void {
    this.drawChart();
    this.createDataForChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.rawDataChart){
      if(this.rawDataChart === null ||
        this.rawDataChart === undefined ||
        this.series === undefined) return;

      this.chartData = [];
      this.createDataForChart();
    }
    this.updateIndicatorText();
  }

  createDataForChart() {
    const child = {
      children : []
    };
    if (this.chartData.length == 0) {
      this.chartData.push(child)
    }
    this.chartData[0].children = []
    for (var item = 0; item < this.rawDataChart?.response?.length; item++) {
      const macShortName = this.rawDataChart.response[item].machinePath.substr(this.rawDataChart.response[item].machinePath.lastIndexOf('.') + 1);
      const statusColor = this.config.getMachineStatusColorFromStatusValue(this.rawDataChart.response[item].machineStatusValue);
      const labelColor = statusColor == this.config.getColor('black') ? this.config.getColor('white') : this.config.getColor('black');
      this.bubbleSizePerc = this.rawDataChart.response[item].sizePerc / 1.0;
      let speed = Math.round(this.rawDataChart.response[item].machineSpeed * 10.0) / 10.0;
      if (this.rawDataChart.response[item].machineSpeed < 1.0) {
        speed = Math.round(this.rawDataChart.response[item].machineSpeed * 100.0) / 100.0;
      }
      let tooltipText = '[bold]' + this.rawDataChart.response[item].machineName + '[/]:  ' +  this.rawDataChart.response[item].machineStatusName;
      if ((speed || speed === 0) && this.rawDataChart.response[item].machineUoM) {
        this.translate.get(['COMMON.Realtime_Speed', 'SHARED.min']).subscribe((translations) => {
          tooltipText =  tooltipText + '\n' + translations['COMMON.Realtime_Speed'] + ': ' + speed + ' ' + this.rawDataChart.response[item].machineUoM + '/' + translations['SHARED.min'];
        });
      }
      if (this.rawDataChart.response[item].hasLiveData && this.rawDataChart.response[item].liveDataCurrent) {
        // this.translate.get(['SHARED.Live_Data']).subscribe((translations) => {
        //   tooltipText = tooltipText + '\n\n' + '[bold]' + translations['SHARED.Live_Data'] + '[/]';
          this.rawDataChart.response[item].liveDataCurrent.forEach(data => {
            tooltipText = tooltipText + '\n' + data.description + ': ' + data.value + ' ' + data.uom;
          });
        // });
      }
      if (this.rawDataChart.response[item].isInAlarm && this.rawDataChart.response[item].alarmCode && this.rawDataChart.response[item].alarmName) {
        this.translate.get(['COMMON.Alarm']).subscribe((translations) => {
          tooltipText = tooltipText + '\n' + translations['COMMON.Alarm']  + ': ' + this.rawDataChart.response[item].alarmCode + ' - ' + this.rawDataChart.response[item].alarmName;
        });
        
      }

      const obj = {
        machineName: this.rawDataChart.response[item].machineName,
        machinePath: this.rawDataChart.response[item].machinePath,
        machineShortName: macShortName,
        machineStatus: this.rawDataChart.response[item].machineStatusName,
        hasLiveData: this.rawDataChart.response[item].hasLiveData,
        hasProductionCounter: this.rawDataChart.response[item].hasProductionCounter,
        iconPath: this.rawDataChart.response[item].iconPath,
        statusColor: am5.color(statusColor),
        labelColor: am5.color(labelColor),
        machinePercX: am5.percent(this.rawDataChart.response[item].machinePercX),
        machinePercY: am5.percent(this.rawDataChart.response[item].machinePercY),
        bubbleSize: this.rawDataChart.response[item].sizePerc,
        linkedMachinesPath: (this.rawDataChart.isOrderActive === true) ? this.rawDataChart.response[item].linkedMachinesName : [],
        isFixed: true,
        labelUp: this.rawDataChart.response[item].labelUp,
        machineSpeed: speed,
        speedUoM: this.rawDataChart.response[item].machineUoM,
        tooltipText: tooltipText,
        children: [],
      };
      if (this.rawDataChart.response[item].isInUse === true || this.rawDataChart.isOrderActive === false) {
        this.chartData[0].children.push(obj);
      }
    }
    this.updateChartData();
  }

  updateChartData() {
    const self = this

    // Evalute if chart needs full draw
    if (this.oldChartData.length > 0 && this.chartData.length > 0) {
      if (this.oldChartData[0].children.length == this.chartData[0].children.length) {
        for (var item = 0; item < this.chartData[0].children.length; item++) {

          var linkedMachineIsSame = this.chartData[0].children[item].linkedMachinesPath.length == this.oldChartData[0].children[item].linkedMachinesPath.length;
          if (this.chartData[0].children[item].linkedMachinesPath.length == this.oldChartData[0].children[item].linkedMachinesPath.length &&
            this.chartData[0].children[item].linkedMachinesPath.length > 0 && this.oldChartData[0].children[item].linkedMachinesPath.length > 0) {
             linkedMachineIsSame = (this.chartData[0].children[item].linkedMachinesPath.length == this.oldChartData[0].children[item].linkedMachinesPath.length) &&
              this.chartData[0].children[item].linkedMachinesPath.every(function(element, index) {
                return element === self.oldChartData[0].children[item].linkedMachinesPath[index];
              });
          }
          if ((this.chartData[0].children[item].machinePath !== this.oldChartData[0].children[item].machinePath) || !linkedMachineIsSame) {
            this.fullDataUpdate = true;
            break;
          }
        }
      } else {
        this.fullDataUpdate = true;
      }
    } else {
      this.fullDataUpdate = true;
    }


    if (this.fullDataUpdate) {
      this.series.data.setAll(this.chartData);
      this.series.set("selectedDataItem", this.series.dataItems[0]);
    } else {
      for (var item = 0; item < this.chartData[0].children.length; item++) {
       this.updateChartStatus(this.chartData[0].children[item].machinePath,this.chartData[0].children[item].statusColor,this.chartData[0].children[item].tooltipText)
      }
    }

    // let exporting = am5exporting.Exporting.new(this.root, {
    //   menu: am5exporting.ExportingMenu.new(this.root, {}),
    //   dataSource: this.chartData
    // });
    this.updateIndicatorText();

    if (this.chartData[0]?.children.length == 0 || this.chartData.length == 0 || this.noData || this.isLoading) {
      this.indicator.show();
    } else {
      if (this.indicator) {
        this.indicator.hide();
        // this.noData.emit(false);
      }
    }

    this.oldChartData = this.chartData;
    this.fullDataUpdate = false;
  }

  updateChartStatus(targetId,color,tooltipText) {
    function updateStatus(series) {

      var targetNode;
      series.nodes.each(function(node) {
        if (node.dataItem.get("id") == targetId) {
          targetNode = node;
        }
      })

      if (targetNode) {
        var dataItem = targetNode.dataItem;
        dataItem.set('fill', color);

        // Set circle color
        dataItem.get('circle').set('stroke', color);

        // Set icon color
        targetNode.children.each(function(child) {
          if (child.className === 'Graphics') {
            child.set('fill', color);
          }
        })

        // Set tooltip color
        targetNode.get('tooltip').get('background').setAll({
          fill: color,
        });

        // Update other info, shown in the tooltip
        targetNode.set("tooltipText", tooltipText);

      }
    }

    updateStatus(this.series);

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
    this.updateIndicatorText();
  }

  updateIndicatorText() {
    if (this.serverError === true) {
      this.translate.get(["SHARED.Server_Error_While_Data_Loading"]).subscribe((translations) => {
        const text = translations["SHARED.Server_Error_While_Data_Loading"];
        this.indicatorLabel.set("text", text)
      });
    } else if ((this.noData || this.chartData[0]?.children.length == 0 || this.chartData.length == 0) && !this.isLoading) {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        const text = translations["SHARED.No_Data_Available"];
        this.indicatorLabel.set("text", text)
      });
    } else {
      const text = '';
      this.indicatorLabel.set("text", text)
    }

  }


  drawChart() {
    const self = this
    this.root = am5.Root.new(this.chartId);

    // this.root.setThemes([
    //   am5themes_Animated.new(this.root)
    // ]);

    this.container = this.root.container.children.push(
      am5.Container.new(this.root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: this.root.verticalLayout,

      })
    );

    //Series
    this.series = this.container.children.push(
      am5hierarchy.ForceDirected.new(this.root, {
        downDepth: 1,
        initialDepth: 1,
        topDepth: 1,
        idField: 'machinePath',
        categoryField: 'machineName',
        valueField: 'bubbleSize',
        childDataField: 'children',
        linkWithField: 'linkedMachinesPath',
        fillField: 'statusColor',
        xField: 'machinePercX',
        yField: 'machinePercY',
        minRadius:18,
        maxRadius: 18,
        interactive: false,
        stateAnimationDuration : 0,
        showOnFrame: 0,
        sequencedDelay: 0,
        position: 'absolute',
        interpolationDuration: 0,
        forceInactive: true,
        draggable: false,
        animationDuration: 0,
      })
    );
    this.series.events.on('datavalidated', function(ev) {
      // self.isLoading.emit(false);
    });

    //Open modal with machine speed & live data
    this.series.nodes.template.events.on('click', function(ev) {
      const machinePath = ev.target.dataItem.dataContext["machinePath"];
      const machineName = ev.target.dataItem.dataContext["machineName"];
      const hasLiveData = ev.target.dataItem.dataContext["hasLiveData"];
      const hasProductionCounter = ev.target.dataItem.dataContext["hasProductionCounter"];
      if (hasLiveData || hasProductionCounter) {
        self.openMachineDataDetailsModal(machinePath,machineName,hasLiveData,hasProductionCounter)
      }
    });

    this.showIndicator();

    //Labels
    this.series.labels.template.setAll({
      fill: am5.color(0x000000),
      // y: am5.percent(10),
      oversizedBehavior: "none",
      // text: "machineName"
      fontSize: 10,
      centerX: am5.p50
    });
    this.series.labels.template.adapters.add("y", function(y, target) {
      let labelUp = target.dataItem.dataContext["labelUp"]
      return labelUp == false ? 20 : -20;
    });
    this.series.labels.template.adapters.add("centerY", function(y, target) {
      let labelUp = target.dataItem.dataContext["labelUp"]
      return labelUp == false ? am5.p0 : am5.p100;
    });


    //Tooltip
    self.series.nodes.template.setAll({
      tooltipText: "{tooltipText}",
      interactiveChildren: false
    });

    //Links
    this.series.links.template.setAll({
      interactive: false,
      strokeWidth: 2,
    });

    this.series.links.template.adapters.add("stroke", function() {
      return am5.color(self.config.getColor('grey_2'))
    });


    // Use template.setup function to prep up node with an image
    this.series.nodes.template.setup = function(target) {
      target.events.on("dataitemchanged", function(ev) {
        let iconScale = self.bubbleSizePerc/ 220.0;
        if (iconScale < 0.01) {
          iconScale = 0.01;
        }

        var tooltip = am5.Tooltip.new(self.root, {
          getFillFromSprite: false,
          autoTextColor: false,

        });
        tooltip.get("background").setAll({
          fill: ev.target.dataItem.dataContext["statusColor"],
        });
        tooltip.label.setAll({
          fill: ev.target.dataItem.dataContext["labelColor"]
        });

        target.set("tooltip", tooltip);

        var icon = target.children.push(am5.Graphics.new(self.root, {
          stroke: ev.target.dataItem.dataContext["statusColor"],
          fill: ev.target.dataItem.dataContext["statusColor"],
          svgPath: ev.target.dataItem.dataContext["iconPath"],
          centerX: am5.p50,
          centerY: am5.p50,
          scale: iconScale
        }));
      });
    }


    this.series.nodes.template.setAll({
      draggable: false,
      toggleKey: "none",
      cursorOverStyle: "default"
    });


    this.series.circles.template.setAll({
      interactive: true,
      strokeOpacity: 1,
      strokeWidth: 2,
      fill: am5.color(0xffffff),
      fillOpacity: 1
    });

    // this.series.data.setAll(this.chartData);
    // this.series.set("selectedDataItem", this.series.dataItems[0]);

  }

  openMachineDataDetailsModal(machinePath,machineName,hasLiveData,hasProductionCounter) {
    const obj = {
      machinePath: machinePath,
      machineName: machineName,
      hasLiveData: hasLiveData,
      hasProductionCounter: hasProductionCounter,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      processCellPath: this.processCellPath
    };
    const ref = this.dialogService.open(MachineDataDetailsComponent, {
      context: obj as Partial<MachineDataDetailsComponent>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {

    });
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }
}
