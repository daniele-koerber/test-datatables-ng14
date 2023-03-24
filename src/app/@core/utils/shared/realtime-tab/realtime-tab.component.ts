import { Component, Input, Output, OnChanges, OnInit, SimpleChanges, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { TranslateService } from '@ngx-translate/core';
import { BaseClass } from '../../common/base-class/base-class';

export interface primaryArrayElement {
  title: string,
  value: number,
  disabled: boolean,
}
export interface machinesArrayElement {
  title: string,
  value: number,
  status: string,
  path: string,
}

@Component({
  selector: 'ngx-realtime-tab',
  templateUrl: './realtime-tab.component.html',
  styleUrls: ['./realtime-tab.component.scss']
})
export class RealtimeTabComponent extends BaseClass implements OnChanges {

  @HostListener('window:resize', ['$event'])
  onResize() {
    setTimeout(() => {
      if(this.secondaryTabContainer.nativeElement?.offsetWidth >= $('#secondaryTab')[0]?.offsetWidth){
        this.hideScrollButtons = true;
      }else {
        this.hideScrollButtons = false;
      }
    }, 100);
  }

  @ViewChild('secondaryTabContainer') private secondaryTabContainer: ElementRef;

  @Input() machinesArray: machinesArrayElement[] = [];
  @Input() resetTabSel: number = 0;
  @Output() primaryTabChanged: EventEmitter<primaryArrayElement> = new EventEmitter<primaryArrayElement>();
  @Output() machinesTabChanged: EventEmitter<machinesArrayElement> = new EventEmitter<machinesArrayElement>();

  @Input() hidePrimaryTab: boolean = false;
  @Input() hideMachinesTab: boolean = false;

  @Input() disableOrderTab: boolean = false;
  @Input() disableShiftTab: boolean = false;

  primaryTabSelIndex = 0
  machineTabSelIndex = 0

  @Input() mainFilterArray: primaryArrayElement[] = [
    { value: 0, title: 'Order', disabled: false},
    { value: 1, title: 'Shift', disabled: false}
  ]
  hideScrollButtons: boolean = false;
  timeout: NodeJS.Timeout;
  orderText: string = "Order";
  shiftText: string = "Shift";

  // rootMachinesArray: machinesArrayElement[] = [];

  constructor(
    public translate: TranslateService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
    this.translate.get(["REPORT.Order","REPORT.Shift"]).subscribe((translations) => {
      this.orderText = translations["REPORT.Order"];
      this.shiftText = translations["REPORT.Shift"];

      this.mainFilterArray = [
        { value: 0, title: this.orderText, disabled: false},
        { value: 1, title: this.shiftText, disabled: false}
      ]
    });


  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.disableOrderTab?.currentValue != undefined){
      this.mainFilterArray.find(el => el.value === 0).disabled = changes.disableOrderTab?.currentValue;

      let newPrimaryTabSelIndex = this.mainFilterArray.find(el => el.value === 0).disabled === true ? 1 : 0;
      if(newPrimaryTabSelIndex !== this.primaryTabSelIndex){
        this.emitChangeMainFilter(newPrimaryTabSelIndex);
      }
    }
    if(changes.disableShiftTab?.currentValue != undefined){
      this.mainFilterArray.find(el => el.value === 1).disabled = changes.disableShiftTab?.currentValue;

      let newPrimaryTabSelIndex = this.mainFilterArray.find(el => el.value === 0).disabled === true ? 1 : 0;
      if(newPrimaryTabSelIndex !== this.primaryTabSelIndex){
        this.emitChangeMainFilter(newPrimaryTabSelIndex);
      }
    }

    if (changes.resetTabSel?.currentValue) {
      this.machineTabSelIndex = 0;
    }
    if (changes.machinesArray) {
      setTimeout(() => {
        if(this.secondaryTabContainer.nativeElement?.offsetWidth >= $('#secondaryTab')[0]?.offsetWidth){
          this.hideScrollButtons = true;
        }else {
          this.hideScrollButtons = false;
        }
      }, 100);
      // const  machinesArraySorted =  this.machinesArray.slice().sort();
      // if(
      //   this.rootMachinesArray.length === this.machinesArray.length && this.rootMachinesArray.slice().sort().every(function(value, index) {
      //     return value === machinesArraySorted[index];
      //   })
      // ) { console.log('uguali',  this.machinesArray); } else { console.log('diversi',  this.machinesArray); }

      // if (
      //   !(
      //     this.machinesArray.length === this.rootMachinesArray.length &&
      //     this.machinesArray.every((value, index) => value === this.rootMachinesArray[index])
      //   )
      // ) {
      //   console.log("update", this.rootMachinesArray, this.machinesArray)
      //   this.rootMachinesArray = this.machinesArray;
      // } else {
      //   console.log("dont'update", this.rootMachinesArray, this.machinesArray)
      // }
    }
  }

  slideLeft() {
    setTimeout(() => {
      this.timeout = setInterval(() => {
        this.secondaryTabContainer.nativeElement.scrollLeft = this.secondaryTabContainer.nativeElement.scrollLeft - 25;
      }, 50);
    }, 0);
  }
  slideRight() {
    setTimeout(() => {
      this.timeout = setInterval(() => {
        this.secondaryTabContainer.nativeElement.scrollLeft = this.secondaryTabContainer.nativeElement.scrollLeft + 25;
      }, 50);
    }, 0);
  }

  resetTimer(){
    clearInterval(this.timeout);
  }

  emitChangeMainFilter(event: number): void {
    this.primaryTabSelIndex = event;
    this.machineTabSelIndex = 0;
    const value:primaryArrayElement = this.mainFilterArray[event];
    this.primaryTabChanged.emit(value);
  }

  emitChangeMachine(event: number): void {
    this.machineTabSelIndex = event;
    const value:machinesArrayElement = this.machinesArray[event];
    this.machinesTabChanged.emit(value);
  }
}
