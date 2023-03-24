import { Component, Input, AfterViewInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfigurationData } from '../../../data/configuration';

@Component({
  selector: 'ngx-select-process-cell-modal',
  styleUrls: ['./select-process-cell-modal.component.scss'],
  templateUrl: './select-process-cell-modal.component.html',
})

export class SelectProcessCellComponent implements AfterViewInit{

  @Input() title = 'Select process cell';
  @Input() message = '';

  @Input() processCellList: string[];

  processCellOptions: any[] = [];

  selectedProcessCell;
  processCellsFullList: any;

  constructor(
    private configurationService: ConfigurationData,
    protected ref: NbDialogRef<SelectProcessCellComponent>,
  ) {
  }

  ngAfterViewInit(): void {
    this.processCellsFullList = this.configurationService.getProcessCellsArray();
    this.processCellsFullList.forEach(processCell => {
      if (this.processCellList.find(cell => cell === processCell.path)) {
        this.processCellOptions.push(processCell);
      }
    });
  }

  cancel() {
    this.ref.close();
  }

  submit(cell) {
    this.ref.close(cell);
  }

}
