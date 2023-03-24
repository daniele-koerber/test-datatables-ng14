import { Component,Input, OnInit, Output, EventEmitter, } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import { NbToastrService } from '@nebular/theme';
import { ConfigService } from '../../../services/config.service';
import { ConfigurationData } from '../../../../data/configuration';
import { SchedulingData } from '../../../../data/scheduling';
import { IntegrationData } from '../../../../data/integration';


import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";

import { MachineDataDetailsComponent } from '../../../../../@core/utils/shared/line-status-chart/machine-data-details/machine-data-details.component';

import { Subscription } from 'rxjs';
import { SignalRNotificationService } from '../../../services';
import { BaseClass } from '../../../common/base-class/base-class';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-machines-status-chart',
  styleUrls: ['./machines-status-chart.component.scss'],
  templateUrl: './machines-status-chart.component.html',
})

export class MachinesStatusChartComponent extends BaseClass implements OnInit {

  @Input() tabIndex: number;
  selectedProcessCell: any;
  pcSub: Subscription;
  loadSub: Subscription;

  isFirstLoading = false;
  serverError = false;
  showAllMachine = false;
  fullDataUpdate = true;
  showInfo = false;

  series: am5hierarchy.ForceDirected
  container: am5.Container
  root: am5.Root
  indicator: any;

  chartId = 'machineStatusFullchartId'
  chartRawData;
  chartData = [{
    children : []
  }];
  oldChartData = []
  macStatus = [];
  statusValue = [];
  legendStatus = [];
  bubbleSizePerc

  periodicRepeat;
  signalRSubscription: Subscription;



  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private scheduleService: SchedulingData,
    private translate: TranslateService,
    private integrationService: IntegrationData,
    private signalR: SignalRNotificationService,
    private toastService: NbToastrService,
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
    this.isLoading = true;
    this.isFirstLoading = true;
    this.showAllMachine = false;
    this.fullDataUpdate = true;
    this.showInfo = false;

    this.waitConfigurationServiceLoaded();

    this.setPeriodicRefresh();
    

  }

  ngAfterViewInit(): void {
    am5.ready(() => {
      setTimeout(() => {
        this.drawChart();
        this.signalRSubscription = this.signalR.signalR_Listener.subscribe( () => {
          this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
          if (this.selectedProcessCell) {
            this.updateTargetProcessCellData();
          }
        });
      }, 100);
    });

  }

  setPeriodicRefresh() {
    const interval = this.config.getTimedUpdateMs();
    this.periodicRepeat = window.setInterval(() => {
      this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
      if(this.selectedProcessCell) {
        this.updateTargetProcessCellData();
      }
    }, interval)
  }

  updatePeriodicRefresh() {
    clearInterval(this.periodicRepeat);
    this.setPeriodicRefresh();
  }

  cancelPeriodicRefresh() {
    clearInterval(this.periodicRepeat);
  }

  getMachineStatusColor(val) {
    return this.config.getMachineStatusColorFromStatusValue(val);
  }

  updateTargetProcessCellData() {
    this.serverError = false;
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    const index = 0;
    const count = 1;
    this.integrationService.getMachineLineStatus(this.selectedProcessCell.path, true).then(statusData =>   {
      this.chartRawData = statusData;
      this.createDataForChart();
    }).catch(error => {
      this.serverError = true;
      this.isLoading = false;
      this.loadingFinished.emit(true);
      this.chartData = [];
      this.updateChartData()
    })

  }

  createDataForChart() {
    const child = {
      children : []
    };
    if (this.chartData.length == 0) {
      this.chartData.push(child)
    }
    this.chartData[0].children = []
    this.statusValue = [];
    this.macStatus = [];
    this.legendStatus = [];
    for (var item = 0; item < this.chartRawData.response.length; item++) {
      const macShortName = this.chartRawData.response[item].machinePath.substr(this.chartRawData.response[item].machinePath.lastIndexOf('.') + 1);
      const statusColor = this.getMachineStatusColor(this.chartRawData.response[item].machineStatusValue);
      const labelColor = statusColor === this.config.getColor('black') ? this.config.getColor('white') : this.config.getColor('black');
      this.bubbleSizePerc = this.chartRawData.response[item].sizePerc / 2.0;
      let speed = Math.round(this.chartRawData.response[item].machineSpeed * 10.0) / 10.0;
      if (this.chartRawData.response[item].machineSpeed < 1.0) {
        speed = Math.round(this.chartRawData.response[item].machineSpeed * 100.0) / 100.0;
      }
      let tooltipText = '[bold]' + this.chartRawData.response[item].machineName + '[/]:  ' +  this.chartRawData.response[item].machineStatusName;
      if ((speed || speed === 0) && this.chartRawData.response[item].machineUoM) {
        this.translate.get(['COMMON.Realtime_Speed', 'SHARED.min']).subscribe((translations) => {
          tooltipText =  tooltipText + '\n' + translations['COMMON.Realtime_Speed'] + ': ' + speed + ' ' + this.chartRawData.response[item].machineUoM + '/' + translations['SHARED.min'];
        });
      }

      if (this.chartRawData.response[item].hasLiveData) {
        // this.translate.get(['SHARED.Live_Data']).subscribe((translations) => {
        //   tooltipText = tooltipText + '\n\n' + '[bold]' + translations['SHARED.Live_Data'] + '[/]';
          this.chartRawData.response[item].liveDataCurrent.forEach(data => {
            tooltipText = tooltipText + '\n' + data.description + ': ' + data.value + ' ' + data.uom;
          });
        // });
      }
      if (this.chartRawData.response[item].isInAlarm && this.chartRawData.response[item].alarmCode && this.chartRawData.response[item].alarmName) {
        this.translate.get(['COMMON.Alarm']).subscribe((translations) => {
          tooltipText = tooltipText + '\n' + translations['COMMON.Alarm']  + ': ' + this.chartRawData.response[item].alarmCode + ' - ' + this.chartRawData.response[item].alarmName;
        });
      }

      const obj = {
        machineName: this.chartRawData.response[item].machineName,
        machinePath: this.chartRawData.response[item].machinePath,
        machineShortName: macShortName,
        machineStatus: this.chartRawData.response[item].machineStatusName,
        hasLiveData: this.chartRawData.response[item].hasLiveData,
        hasProductionCounter: this.chartRawData.response[item].hasProductionCounter,
        iconPath: this.chartRawData.response[item].iconPath,
        statusColor: am5.color(statusColor),
        labelColor: am5.color(labelColor),
        machinePercX: am5.percent(this.chartRawData.response[item].machinePercX),
        machinePercY: am5.percent(this.chartRawData.response[item].machinePercY),
        bubbleSize: this.chartRawData.response[item].sizePerc,
        linkedMachinesPath: ((this.chartRawData.isOrderActive === true) &&  (this.chartRawData.response[item].isInUse === true)) ? this.chartRawData.response[item].linkedMachinesName : [],
        isFixed: true,
        labelUp: this.chartRawData.response[item].labelUp,
        machineSpeed: speed,
        speedUoM: this.chartRawData.response[item].machineUoM,
        tooltipText: tooltipText,
        children: [],
      };

      if (this.chartRawData.response[item].isInUse === true || this.chartRawData.isOrderActive == false || this.showAllMachine == true ) {
        this.chartData[0].children.push(obj);
        if (!this.statusValue.includes(this.chartRawData.response[item].machineStatusValue)) {
          const obj = {
            statusName: this.chartRawData.response[item].machineStatusName,
            statusValue: this.chartRawData.response[item].machineStatusValue,
          }
          const legendObj = {
            name: this.chartRawData.response[item].machineStatusName,
            fill: am5.color(this.getMachineStatusColor(this.chartRawData.response[item].machineStatusValue)),
          }
          this.statusValue.push(this.chartRawData.response[item].machineStatusValue),
          this.macStatus.push(obj);
          this.legendStatus.push(legendObj);
        }
      }

    }

    this.isLoading = false;
    this.loadingFinished.emit(true);
    this.updateChartData()
  }


  updateChartData() {
    
    const self = this
    if (!this.root) {return}

    //Evalute if chart needs full draw
    // if (this.oldChartData.length > 0) {
    //   if (this.oldChartData[0].children.length == this.chartData[0].children.length) {
    //     for (var item = 0; item < this.chartData[0].children.length; item++) {
    //       if ((this.chartData[0].children[item].machinePath !== this.oldChartData[0].children[item].machinePath) ||
    //       (this.chartData[0].children[item].linkedMachinesPath !== this.oldChartData[0].children[item].linkedMachinesPath)) {
    //         this.fullDataUpdate = true;
    //         break;
    //       }
    //     }
    //   } else {
    //     this.fullDataUpdate = true;
    //   }
    // } else {
    //   this.fullDataUpdate = true;
    // }
    this.fullDataUpdate = true;



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


      if ((this.chartData[0]?.children.length == 0 || this.chartData.length == 0 || this.serverError) && ! this.isLoading) {
        this.indicator.show();
        this.isLoading = false;
        this.loadingFinished.emit(true);
        this.showInfo = false;
      } else {
        if (this.indicator) {
          this.indicator.hide();
        }
      }


    this.oldChartData = this.chartData;
    this.fullDataUpdate = true;
    
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
        dataItem.set("fill", color);

        // Set circle color
        dataItem.get("circle").set("stroke", color);

        // Set icon color
        targetNode.children.each(function(child) {
          if (child.className == "Graphics") {
            child.set("fill", color);
          }
        })

        // Set tooltip color
        targetNode.get("tooltip").get("background").setAll({
          fill: color
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
    let indicatorLabel = this.indicator.children.push(am5.Label.new(this.root, {
      fontSize: 20,
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
    } else {
      this.translate.get(["SHARED.No_Data_Available"]).subscribe((translations) => {
        const text = translations["SHARED.No_Data_Available"];
        indicatorLabel.set("text", text)
      });
    }
  }

  drawChart() {
    const self = this

    this.root = am5.Root.new(this.chartId);

    this.container = this.root.container.children.push(
      am5.Container.new(this.root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: this.root.verticalLayout,

      })
    );

    this.series = this.container.children.push(
      am5hierarchy.ForceDirected.new(this.root, {
        downDepth: 1,
        initialDepth: 1,
        topDepth: 1,
        idField: "machinePath",
        categoryField: "machineName",
        valueField: "bubbleSize",
        childDataField: "children",
        linkWithField: "linkedMachinesPath",
        fillField: "statusColor",
        xField: "machinePercX",
        yField: "machinePercY",
        minRadius:25,
        maxRadius: 25,
        interactive: false,
        stateAnimationDuration : 0,
        showOnFrame: 0,
        sequencedDelay: 0,
        position: "absolute",
        interpolationDuration: 0,
        forceInactive: true,
        draggable: false,
        animationDuration: 0,
      })
    );
    this.series.events.on("datavalidated", function(ev) {
      self.isLoading = false;
      self.loadingFinished.emit(true);
      self.showInfo = true;
    });

    //Open modal with machine speed & live data
    this.series.nodes.template.events.on("click", function(ev) {
      const machinePath = ev.target.dataItem.dataContext["machinePath"];
      const machineName = ev.target.dataItem.dataContext["machineName"];
      const hasLiveData = ev.target.dataItem.dataContext["hasLiveData"];
      const hasProductionCounter = ev.target.dataItem.dataContext["hasProductionCounter"];

      if (hasLiveData || hasProductionCounter) {
        self.openMachineDataDetailsModal(machinePath,machineName,hasLiveData,hasProductionCounter)
      } else {
        self.translate.get(["COMMON.INFO","SHARED.No_Additional_Data_Available_For_This_Machine"]).subscribe((translations) => {
          self.showToast('top-right', 'info', translations["COMMON.INFO"], translations["SHARED.No_Additional_Data_Available_For_This_Machine"], false);
        });
      }
    });

    //Labels
    this.series.labels.template.setAll({
      fill: am5.color(0x000000),
      // y: am5.percent(10),
      oversizedBehavior: "none",
      // text: "machineName"
      fontSize: 9,
      centerX: am5.p50
    });
    this.series.labels.template.adapters.add("y", function(y, target) {
      let labelUp = target.dataItem.dataContext["labelUp"]
      return labelUp == false ? 30 : -30;
    });
    this.series.labels.template.adapters.add("centerY", function(y, target) {
      let labelUp = target.dataItem.dataContext["labelUp"]
      return labelUp == false ? am5.p0 : am5.p100;
    });

    this.showIndicator();
    this.indicator.hide();

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
        let iconScale = 0.055;//self.bubbleSizePerc/ 80.0;
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

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
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
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    this.cancelPeriodicRefresh();
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }

    this.signalRSubscription?.unsubscribe();

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
