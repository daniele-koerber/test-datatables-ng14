import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NbColorHelper } from '@nebular/theme';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { NbDialogRef } from '@nebular/theme';

import { ConfigService } from '../../../services/config.service';
import { ConfigurationData } from '../../../../data/configuration';
import { SchedulingData } from '../../../../data/scheduling';
import { IntegrationData } from '../../../../data/integration';
import { Subscription } from 'rxjs';

import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5xy from "@amcharts/amcharts5/xy";
import { BaseClass } from '../../../common/base-class/base-class';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'ngx-machine-data-details',
  styleUrls: ['./machine-data-details.component.scss'],
  templateUrl: './machine-data-details.component.html',
})

export class MachineDataDetailsComponent extends BaseClass implements OnInit {


  @Input() machineName;
  @Input() id;
  @Input() processCell: any;
  @Input() hasLiveData = false;
  @Input() hasProductionCounter = false;

  speedData;
  liveData = [];
  speedUoM = '';
  piecesUoM = '';
  showCalendar = false;

  isFirstLoading;
  noDataAvailable=false;
  serverErrorSpeed = false;
  serverErrorLiveData = false;
  selectedProcessCell: any;
  lang = "en"
  pcSub: Subscription;
  loadSub: Subscription;
  minBetweenTwoPointSpeed = 1
  minBetweenTwoPointLive = 1

  speedchartId = 'machineDetailsSpeedchartId'
  livedatachartId = []
  rootSpeed: am5.Root;
  rootLiveData: any;

  helpLinkPage = 'machine-status-details';
  helpPageLinkDestination = '#';

  chartColors = [
    am5.color(this.config.getColor('accent_1')),
    am5.color(this.config.getColor('error')),
    am5.color(this.config.getColor('grey_3')),
    am5.color(this.config.getColor('accent_4')),
    am5.color(this.config.getColor('grey_5')),
    am5.color(this.config.getColor('accent_1')),
    am5.color(this.config.getColor('grey_6')),
    am5.color(this.config.getColor('accent_2')),
    am5.color(this.config.getColor('grey_4')),
    am5.color(this.config.getColor('success')),
    am5.color(this.config.getColor('primary')),
  ]
  indicator: any;
  min: Date;
  max: Date;
  rawDate: Date;

  chartSpeedData: any[] = [];
  date: string;
  dailyChartSpeedData: any;
  chartdataTest: any;

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private scheduleService: SchedulingData,
    private integrationService: IntegrationData,
    private translate: TranslateService,
    private nbAuthService: NbAuthService,
    protected ref: NbDialogRef<MachineDataDetailsComponent>,
  ) {

    super(nbAuthService);
    this.isFirstLoading = true;

    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.lang = lang;
  }

  ngOnInit() {
    this.isLoading = true;
    this.waitConfigurationServiceLoaded();
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

  closeModal() {
    this.ref.close(true);
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
    this.serverErrorSpeed = false;
    this.serverErrorLiveData = false;

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
    if(from && to) {
      this.showCalendar = true;
    }
    if (this.machinePath) {
      this.rootLiveData = [];

      if (this.hasProductionCounter) {
        this.isLoading = true;
        this.integrationService.getMachineSpeed(this.machinePath, from, to, null)
        .then((speeds) => {

          this.speedData = speeds.machineSpeed?.machineSpeeds;

          if (!this.speedData) {
            this.speedData = [];
          }
          //Convert time
          this.speedData?.forEach(item => {
            item.time = (new Date(item.time)).getTime()
          });

            //Calculate base time
            this.minBetweenTwoPointSpeed = 1;
            if (this.speedData?.length >= 2) {
              this.minBetweenTwoPointSpeed = Math.round((this.speedData[2].time - this.speedData[1].time) / 60000.0)
            } else if (this.speedData?.length >= 1) {
              this.minBetweenTwoPointSpeed = Math.round((this.speedData[1].time - this.speedData[0].time) / 60000.0)
            }
            this.minBetweenTwoPointSpeed = isNaN(this.minBetweenTwoPointSpeed) || this.minBetweenTwoPointSpeed === 0 ? 1 : this.minBetweenTwoPointSpeed;
          //Add MOM speed
          speeds.machineSpeed?.parameterSpeeds.forEach(item => {
            let MOMSpeed = {
              time: (new Date(item.time)).getTime(),
              MOMSpeed: item.speed
            }
            this.speedData.push(MOMSpeed)
          });
          this.piecesUoM = speeds.machineSpeed?.uoMValue
          this.translate.get(["SHARED.min"]).subscribe((translations) => {
            this.speedUoM = "(" + this.piecesUoM + "/" + translations["SHARED.min"] + ")"
          })

          if (!this.chartSpeedData.find(el => el.date === this.date)){
            this.chartSpeedData.push({  date: this.date,
                                        data: this.speedData,
                                    });
          }
          this.dailyChartSpeedData = this.chartSpeedData.find(el => el.date === this.date)?.data;
          this.isLoading = false;
          if(this.speedData?.length === 0) {
            this.noDataAvailable = true;
          }
          this.speedData?.forEach(element => {
            if(element.$id !== undefined){
              let samespeed = this.speedData.filter(el => el.$id !== undefined && el.time === element.time && el.$id !== element.$id)
              if(samespeed.length > 0) {

              }
            }
          });
          this.speedData = this.speedData.sort(function(a, b) {
            if (a.time > b.time)
              return 1;
            else if (a.time < b.time)
              return -1;
            else
              return 0;
          })

        }).catch(error => {

          this.serverErrorSpeed = true;

          this.isLoading = false;
          this.speedData = [];
        })
      }

      if (this.hasLiveData) {
        this.isLoading = true;
        this.integrationService.getLiveData(this.machinePath, from, to, null).then((liveData) => {
          this.liveData = liveData.liveData

          //Convert time
          this.liveData.forEach((chart, index) => {
            chart.values.forEach(item => {
              item.time = (new Date(item.time)).getTime()
            });

            //Calculate base time
            let minBetweenTwoPointLive = 1;
            if (chart.values.length >= 2) {
              minBetweenTwoPointLive = Math.round((chart.values[2].time - chart.values[1].time) / 60000.0)
            } else if (chart.values.length >= 1) {
              minBetweenTwoPointLive = Math.round((chart.values[1].time - chart.values[0].time) / 60000.0)
            }
            minBetweenTwoPointLive= isNaN(minBetweenTwoPointLive) ? 1 : minBetweenTwoPointLive;

            //Add chart ID
            const chartId = chart.name + "chartId";
            chart.chartId = chartId
            chart.minBetweenTwoPoint = minBetweenTwoPointLive;
            chart.color = this.chartColors[index];
            this.isLoading = false;

          })
        }).catch(error => {
          console.log("serverErrorSpeed")

          this.serverErrorSpeed = true;
          this.isLoading = false;
          this.liveData = [];
        })
      }
    } else {
      console.log ("KODIS: machine path argument missing")
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

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if ((loaded === true) ) {
        this.setHelpPage();
        this.updateTargetProcessCellData();
      }
    });
  }

}
