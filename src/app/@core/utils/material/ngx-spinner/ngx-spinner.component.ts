import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-spinner',
  // templateUrl: './ngx-spinner.component.html',
  template:`<mat-spinner class="mat-spinner" *ngIf="isLoading" [diameter]=" diameter " [strokeWidth]="strokeWidth"></mat-spinner>`,
  styleUrls: ['./ngx-spinner.component.scss']
})
export class NgxSpinnerComponent implements OnInit {

  @Input() isLoading: boolean;
  @Input() diameter?: number = 50;
  @Input() strokeWidth?: number = 5;

  constructor() { }

  ngOnInit(): void {
  }

}
