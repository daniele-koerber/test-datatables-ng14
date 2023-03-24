import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as Chart from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { NbColorHelper } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';


import { ConfigService } from '../../../services/config.service';
import { ConfigurationData } from '../../../../data/configuration';
import { SchedulingData } from '../../../../data/scheduling';
import { IntegrationData } from '../../../../data/integration';
import { Subscription } from 'rxjs';

import * as moment from 'moment';
import { I } from '@angular/cdk/keycodes';
import { BaseClass } from '../../../common/base-class/base-class';

@Component({
  selector: 'ngx-machines-speed-chart',
  styleUrls: ['./machines-speed-chart.component.scss'],
  templateUrl: './machines-speed-chart.component.html',
})

export class MachineSpeedChartComponent extends BaseClass implements OnInit {

  @Input() id;
  @Input() showActualValue: boolean = false;


  charts = [];
  chartSetting = [{
    machineName: '',
    UoM: '',
    chartId: '',
    chartData: [],
  }];

  isFirstLoading;
  noDataAvailable=false;
  dataLoaded=false;
  serverError = false;

  chartColors = [];
  selectedProcessCell: any;
  lang = "en"
  pcSub: Subscription;
  loadSub: Subscription;
  chartData: any[] = [];
  minBetweenTwoPointSpeed: any;
  uom: any;
  min: Date;
  max: Date;
  rawDate: Date;
  date: string;

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private scheduleService: SchedulingData,
    private integrationService: IntegrationData,
    private translate: TranslateService,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);

    this.isFirstLoading = true;
    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.lang = lang;
  }

  ngOnInit() {
    this.isLoading = true;
    this.dataLoaded = false;
    this.waitConfigurationServiceLoaded();
    // this.listenForSelectedProcessCellChanges();
  }


  ngOnChanges(changes) {
  }



  updateTargetProcessCellData() {
    if( this.dateStart) {
      this.updateChartData(this.dateStart, this.dateEnd)

    } else if( this.id) {
      this.scheduleService.getOrder(this.processCellPath, this.id).then(batch => {
        this.updateChartData(batch.timeSeriesStart, batch.timeSeriesEnd)
      });
    } else {
      this.updateChartData(null, null)
    }
  }

  updateChartData(dateFrom, dateTo) {
    const pipe = new DatePipe(this.translate.currentLang);
    const from = (!this.dateStart ? null : dateFrom);
    const to = (!this.dateEnd ? null : dateTo);


    this.min = new Date(from);
    this.max = new Date(to);

    this.rawDate = new Date(to);
    this.date = pipe.transform(this.rawDate, 'd MMM y');

    let endDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
    let startDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

    if(new Date(dateFrom).getTime() >= new Date(startDate).getTime()){
      startDate = dateFrom;
    }
    if(new Date(dateTo).getTime() <= new Date(endDate).getTime()){
      endDate = dateTo;
    }

    this.getChartData(startDate, endDate);

  }


  getChartData(from, to) {

    this.serverError = false;
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    const pc = (this.processCellPath ? this.processCellPath : this.selectedProcessCell);
    if (pc) {
      this.integrationService.getMachinesSpeed(pc, from, to, null).then((speeds) => {


        const machinesInUses = speeds.machineSpeeds.filter(speed => speed.isInUse === true)
        const machinesArr = machinesInUses.length ? machinesInUses : speeds.machineSpeeds;

        const chartData = [...machinesArr];

        // if(this.chartData?.speeds?.machineSpeeds?.length === 0) {
        //   this.noDataAvailable = true;
        // }

        chartData.forEach(speeds => {

          speeds.machineSpeeds.forEach(item => {
            item.time = (new Date(item.time)).getTime()
          });

          //Calculate base time
          speeds.minBetweenTwoPointSpeed = 1;
          if (speeds.machineSpeeds.length >= 2) {
            speeds.minBetweenTwoPointSpeed = Math.round((speeds.machineSpeeds[2].time - speeds.machineSpeeds[1].time) / 60000.0)
          } else if (speeds.machineSpeeds.length >= 1) {
            speeds.minBetweenTwoPointSpeed = Math.round((speeds.machineSpeeds[1].time - speeds.machineSpeeds[0].time) / 60000.0)
          }
          speeds.minBetweenTwoPointSpeed = isNaN(speeds.minBetweenTwoPointSpeed) || speeds.minBetweenTwoPointSpeed === 0 ? 1 : speeds.minBetweenTwoPointSpeed;

          //Add MOM speed
          speeds.parameterSpeeds.forEach(item => {
            let MOMSpeed = {
              time: (new Date(item.time)).getTime(),
              MOMSpeed: item.speed
            }
            speeds.machineSpeeds.push(MOMSpeed);
          });

          let piecesUoM = speeds.uoMValue;
          let speedUoM = "";
          this.translate.get(["SHARED.min"]).subscribe((translations) => {
            speedUoM = "(" + piecesUoM + "/" + translations["SHARED.min"] + ")"
          })

          speeds.speedUoM = speedUoM;
          this.isLoading = false;


        });
        this.chartData = [...chartData];
        this.loadingFinished.emit(true);


      }).catch(error => {
        this.serverError = true;
        this.isLoading = false;
        console.error(error)
        this.loadingFinished.emit(true);
      });
    }
  }

  dateChanged(date: Date) {
    const pipe = new DatePipe(this.translate.currentLang);
    setTimeout(() => {
      this.date = pipe.transform(this.rawDate, 'd MMM y');
      this.rawDate = new Date(date);

        let endDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
        let startDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

        if(new Date(this.dateStart).getTime() >= new Date(startDate).getTime()){
          startDate = this.dateStart;
        }
        if(new Date(this.dateEnd).getTime() <= new Date(endDate).getTime()){
          endDate = this.dateEnd;
        }

        this.getChartData(startDate, endDate);
      }, 0);

  }



  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }


  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if (selectedProcessCell !== undefined) {
        this.isLoading = true;
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if ((loaded === true) ) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
