import { Component, OnInit } from '@angular/core';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';

import { ConfigurationData } from '../../../data/configuration';

@Component({
  selector: 'ngx-select-line',
  templateUrl: './select-line.component.html',
  styleUrls: ['./select-line.component.scss'],
})
export class SelectLineComponent implements OnInit {

  processCellsArray = [];
  selectedProcessCell = { key: null };

  isGoToPreviousProcessCellButtonEnabled: boolean = false;
  isGoToNextProcessCellButtonEnabled: boolean = false;
  arrayIndex;
  menuDisabled = true;

  constructor(
    private configurationService: ConfigurationData,
    private authService: NbAuthService,
  ) {
    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanBypassDisplayGroup")) {
        this.menuDisabled = false;
      }
    });
  }

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
    this.listenForSelectedProcessCellChanges();
  }

  updateComponent() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.processCellsArray = this.configurationService.getProcessCellsArray();

    const arrayIndex = this.processCellsArray.findIndex(el => +el.key === +this.selectedProcessCell?.key);
    this.arrayIndex = arrayIndex;
    this.isGoToPreviousProcessCellButtonEnabled = arrayIndex === -1 || arrayIndex === 0 ? false : true;
    this.isGoToNextProcessCellButtonEnabled = arrayIndex === -1 || arrayIndex === (this.processCellsArray.length - 1) ? false : true;
  }

  selectionChange(event) {
    const value = event.value;
    const line = this.processCellsArray.find(el => +el.key === +value);
    this.configurationService.setSelectedProcessCell(line);
    // console.log(line, value, this.processCellsArray)
  }

  goToPreviousProcessCell() {
    const arrayIndex = this.processCellsArray.findIndex(el => +el.key === +this.selectedProcessCell?.key);
    const el = this.processCellsArray[arrayIndex - 1];
    if (el) {
      this.configurationService.setSelectedProcessCell(el);
    }
  }

  goToNextProcessCell() {
    const arrayIndex = this.processCellsArray.findIndex(el => +el.key === +this.selectedProcessCell?.key);
    const el = this.processCellsArray[arrayIndex + 1];
    if (el) {
      this.configurationService.setSelectedProcessCell(el);
    }
  }

  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateComponent();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateComponent();
      }
    });
  }

}
