import { Component, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import { SchedulingData } from '../../../../@core/data/scheduling';
import { QualityData } from '../../../../@core/data/quality';
import { IntegrationData } from '../../../../@core/data/integration';
import { ConfigurationData } from '../../../../@core/data/configuration';

import { QualityReportTableModalComponent } from '../quality-report-table-modal/quality-report-table-modal.component';
import { DowntimeReportTableModalComponent } from '../downtime-report-table-modal/downtime-report-table-modal.component'

import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-report-buttons-card',
  styleUrls: ['./report-buttons-card.component.scss'],
  templateUrl: './report-buttons-card.component.html',
})

export class ReportButtonsCardComponent {

  @Input() dateStart: any;
  @Input() dateEnd: any;
  @Input() processCell: any;

  enableQualityTableButton = false;
  enableDowntimeTableButton = false;
  hasNonCompliantChecks = false;
  loadSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private dialogService: NbDialogService,
    public translate: TranslateService,
    private scheduleService: SchedulingData,
    private qualityService: QualityData,
    private integrationService: IntegrationData,
    private configurationService: ConfigurationData,

  ) { 

  }

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.dateStart || changes.dateEnd || changes.processCell){
      if (this.dateStart && this.dateEnd && this.processCell) {
        console.log("FIGA")
        this.updateTargetProcessCellData();
      }
    }
  }

  updateTargetProcessCellData() {
    if(this.processCell) {
      this.qualityService.getQualityChecksCountSummaryByProcessCellPath(this.processCell, this.dateStart, this.dateEnd).then(res => {
        this.enableQualityTableButton = (res.response.totalChecks > 0);
        this.hasNonCompliantChecks =  (res.response.nonCompliantChecks > 0);
      })

      this.integrationService.getDowntimeCount(this.processCell, this.dateStart, this.dateEnd).then(res => {
        this.enableDowntimeTableButton = (+res > 0);
      })


    }
  }



  openQualityCheckTable() {
    const obj = {
      from: this.dateStart,
      to: this.dateEnd,
      processCellPath: this.processCell,
    };
    this.dialogService.open(QualityReportTableModalComponent, {
      context: obj as Partial<QualityReportTableModalComponent>,
    });
  }

  openDowntimeTable() {
    const obj = {
      from: this.dateStart,
      to: this.dateEnd,
      processCellPath: this.processCell,
    };
    this.dialogService.open(DowntimeReportTableModalComponent, {
      context: obj as Partial<DowntimeReportTableModalComponent>,
    });
  }

  ngOnDestroy(): void {
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
   }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        // this.updateTargetProcessCellData();
      }
    });
  }



}
