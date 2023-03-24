import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogRef } from '@nebular/theme';
import { BaseClass } from '../../common/base-class/base-class';
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import * as am5xy from "@amcharts/amcharts5/xy";
import { ConfigService } from '../../services';
import { SchedulingData } from '../../../data/scheduling';
import { TranslateService } from '@ngx-translate/core';
import { IntegrationData } from '../../../data/integration';
import { ConfigurationData } from '../../../data/configuration';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ngx-live-data-modal',
  templateUrl: './live-data-modal.component.html',
  styleUrls: ['./live-data-modal.component.scss']
})
export class LiveDataModalComponent extends BaseClass implements AfterViewInit {

  @Input() showActualValue: boolean = false;

  chartColors = [
    am5.color(this.config.getColor('success')),
    am5.color(this.config.getColor('primary')),
    am5.color(this.config.getColor('grey_3')),
    am5.color(this.config.getColor('accent_1')),
    am5.color(this.config.getColor('error')),
    am5.color(this.config.getColor('grey_5')),
    am5.color(this.config.getColor('accent_1')),
    am5.color(this.config.getColor('grey_6')),
    am5.color(this.config.getColor('accent_2')),
    am5.color(this.config.getColor('grey_4')),
    am5.color(this.config.getColor('accent_4')),
  ]
  lang: string;
  dataLoaded: boolean;
  selectedProcessCell: any;
  pcSub: any;
  loadSub: any;
  liveData: any[] = [];
  min: Date;
  max: Date;
  rawDate: Date;
  date: any;
  colorIndex:number = 0;

  constructor(
    private config: ConfigService,
    private scheduleService: SchedulingData,
    private integrationService: IntegrationData,
    private configurationService: ConfigurationData,
    private translate: TranslateService,
    protected ref: NbDialogRef<LiveDataModalComponent>,
    private nbAuthService: NbAuthService) {
    super(nbAuthService);

    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.lang = lang;
  }

  ngAfterViewInit() {
    this.isLoading = true;
    this.dataLoaded = false;
    this.waitConfigurationServiceLoaded();
    // this.listenForSelectedProcessCellChanges();
  }


  updateChartData(dateFrom, dateTo) {
    const pipe = new DatePipe(this.translate.currentLang);
    this.serverError = false;

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
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
    const pc = (this.processCellPath ? this.processCellPath : this.selectedProcessCell);
    this.colorIndex = 0;
    if (pc) {
      if (this.machinePath) {
        this.integrationService.getLiveData(this.machinePath, from, to, null).then((livedata)=>{
          this.liveData = livedata.liveData

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
            minBetweenTwoPointLive= isNaN(minBetweenTwoPointLive) || minBetweenTwoPointLive === 0 ? 1 : minBetweenTwoPointLive;

            //Add chart ID
            const chartId = chart.name + "chartId" + this.colorIndex;
            chart.chartId = chartId
            chart.minBetweenTwoPoint = minBetweenTwoPointLive;
            chart.color = this.chartColors[this.colorIndex];

            this.colorIndex ++;
            if (this.colorIndex >= this.chartColors.length) {
              this.colorIndex = 0;
            }
            this.isLoading = false;
          });
          this.dataLoaded = true;

        }).catch(error => {
          this.serverError = true;
          this.isLoading = false;
          this.liveData = [];
        });;
      } else {
        this.integrationService.getMachinesLiveData(pc, from, to, null).then((livedata) => {
          this.liveData = [];
          for (let mac = 0; mac < livedata.machinesLiveData?.length; mac++) {

            let machineliveData: any[] = livedata.machinesLiveData[mac]?.liveData;
            //Convert time
            machineliveData.forEach((chart, index) => {
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
              minBetweenTwoPointLive= isNaN(minBetweenTwoPointLive) || minBetweenTwoPointLive === 0 ? 1 : minBetweenTwoPointLive;

              //Add chart ID
              const chartId = chart.name + "chartId" + this.colorIndex;
              chart.chartId = chartId
              chart.minBetweenTwoPoint = minBetweenTwoPointLive;
              chart.color = this.chartColors[this.colorIndex];

              this.colorIndex ++;
              if (this.colorIndex >= this.chartColors.length) {
                this.colorIndex = 0;
              }
              this.isLoading = false;

              this.liveData.push(chart);
            });
          }

          this.dataLoaded = true;
        }).catch(error => {
          this.serverError = true;
          this.isLoading = false;
          this.liveData = [];
        });
      }
    }

  }


  updateTargetProcessCellData() {
    if( this.dateStart) {
      this.updateChartData(this.dateStart, this.dateEnd)
    } else {
      this.updateChartData(null, null)
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

  closeModal(){
    this.ref.close();
  }
}
