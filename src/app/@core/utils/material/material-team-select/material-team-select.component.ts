import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-material-team-select',
  templateUrl: './material-team-select.component.html',
  styleUrls: ['./material-team-select.component.scss'],
})
export class MaterialTeamSelectComponent implements OnChanges{

  @Output() teamChange: EventEmitter<number> = new EventEmitter<number>();
  @Input() teamArray: any[];
  @Input() currentShift: any;
  @Input() currentDay: any;

  selectedTeam;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedTeam = this.teamArray.find(team => team.id === this.currentShift.teamId);
  }

  selectionChange() {
    this.currentShift.teamId = this.selectedTeam.id;
    this.currentShift.teamName = this.selectedTeam.teamName;
    this.teamChange.emit(this.currentShift);
  }

}
