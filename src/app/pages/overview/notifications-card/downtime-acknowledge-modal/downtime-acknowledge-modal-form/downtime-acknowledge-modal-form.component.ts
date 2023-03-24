import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NbToastrService, NbDialogRef } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import { ConfigurationData } from '../../../../../@core/data/configuration';
import { DowntimeData } from '../../../../../@core/data/downtime';
import { SchedulingData } from '../../../../../@core/data/scheduling';
import { ConfigService } from '../../../../../@core/utils/services';

@Component({
  selector: 'ngx-downtime-acknowledge-modal-form',
  styleUrls: ['./downtime-acknowledge-modal-form.component.scss'],
  templateUrl: './downtime-acknowledge-modal-form.component.html',
})

export class DowntimeAcknowledgeModalFormComponent implements OnInit {

  @Input() downtime: any;
  @Input() row: any;
  hierarchy: any;
  selectedProcessCell: any;

  helpLinkPage = 'downtime-acknowledge-modal-form';
  helpPageLinkDestination = '#';

  machinesArray = [];
  componentsArray = [];
  reasonsArray = [];
  isJustified
  formSaving = false;

  firstForm = new FormGroup({
      confirmedMachinePath: new FormControl(null, Validators.required),
    });
  secondForm = new FormGroup({
      confirmedMachineComponentPath: new FormControl(null, Validators.required),
    });
  thirdForm = new FormGroup({
      confirmedReasonId: new FormControl(null, Validators.required),
      notes: new FormControl(null),
    });

  hideComponentSteps: boolean = true;
  selectedIndex = 0;
  alarmMachine: any = '';

  constructor(
    private config: ConfigService,
    private fb: FormBuilder,
    private downtimeService: DowntimeData,
    private configurationService: ConfigurationData,
    private toastService: NbToastrService,
    protected ref: NbDialogRef<DowntimeAcknowledgeModalFormComponent>,
    private scheduleService: SchedulingData,
    public translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.formSaving = false;
    this.waitConfigurationServiceLoaded();
    this.setHelpPage();
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

  firstFormRadioClick(path) {
    this.firstForm.controls.confirmedMachinePath.patchValue(path);
    this.updateComponentsArray(path);
  }

  secondFormRadioClick(path) {
    this.secondForm.controls.confirmedMachineComponentPath.patchValue(path);
  }

  setNotes(val) {
    this.thirdForm.controls.notes.patchValue(val.target.value);
  }

  thirdFormRadioClick(path) {
    this.thirdForm.controls.confirmedReasonId.patchValue(path);
  }

  updateComponent() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.hierarchy = this.configurationService.getPlantHierarchy();
    this.buildForm();
  }

  waitConfigurationServiceLoaded() {
    this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateComponent();
      }
    });
  }

  updateComponentsArray(path) {

    const machine = this.machinesArray.find(machine => machine.path === path);
    if (machine) {
      this.componentsArray = [{$id: '0', id: 0, code: '0', description: 'Undefined', parent: {$ref: '10'}, fullPath: ''}, ...machine.machineComponents];
    }

    this.hideComponentSteps = this.componentsArray.length > 1  ? false : true;
    if (this.downtime.confirmedMachineComponentPath !== null && this.downtime.confirmedMachineComponentPath !== '') {
      this.secondForm.controls.confirmedMachineComponentPath.patchValue(this.downtime.confirmedMachineComponentPath);
    } else {

      if (this.downtime.assumedMachineComponentPath) {
        this.secondForm.controls.confirmedMachineComponentPath.patchValue(this.downtime.assumedMachineComponentPath);
      }
      if (this.downtime.assumedMachineComponentPath === null) {
        this.secondForm.controls.confirmedMachineComponentPath.patchValue(0);
      }
    }

  }

  onFirstSubmit() {
    this.firstForm.markAsDirty();
  }

  onSecondSubmit() {
    this.secondForm.markAsDirty();
  }

  onThirdSubmit() {
    this.thirdForm.markAsDirty();
  }

  closeModal() {
    this.formSaving = false;
    this.ref.close(true);
  }

  submitForm() {
    if (this.formSaving == true) {return}
    this.formSaving = true;
    var confirmedMachineComponentPathValue = this.secondForm.value.confirmedMachineComponentPath;
    if(!confirmedMachineComponentPathValue || confirmedMachineComponentPathValue == 0){
      confirmedMachineComponentPathValue = "";
    }

    setTimeout(() => {
      this.downtimeService.submitDowntimeAcknowledge(
        +this.downtime.id,
        this.firstForm.value.confirmedMachinePath,
        confirmedMachineComponentPathValue,
        +this.thirdForm.value.confirmedReasonId,
        this.thirdForm.value.notes,
      ).then(
        (success) => { // Success
          this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Downtime_successfully_justified"]).subscribe((translations) => {
            this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Downtime_successfully_justified"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
          });
          this.formSaving = false;
          this.ref.close(true);

        },
        (error) => { // Error
          this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_justifying_downtime"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_justifying_downtime"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
          });
          this.formSaving = false;
          this.ref.close(true);
        },
      );    }, 2000);

  }

  buildForm() {
    // this.getMachines().then(machines => {
      const machines = this.configurationService.getMachines(this.selectedProcessCell.path);
      const includeNotReportingMachines = true;

      this.alarmMachine = machines.find(m => m.path === this.downtime.assumedMachinePath);
      this.isJustified = this.downtime.isJustified;
      this.scheduleService.getEmployedMachines(this.selectedProcessCell.path, this.downtime.startDate, this.downtime.endDate, includeNotReportingMachines).then(filteredList => {

        const machinesArray = [];
        machines.map((machine => {
          if (filteredList.includes(machine.path)) {
            machinesArray.push(machine);
          }
        }));

        this.machinesArray = [{machineComponents: [], key: '0', uom: null, name: 'Undefined', path: ''}, ...machinesArray];

        if (this.downtime.confirmedMachinePath) {

          this.firstForm.controls.confirmedMachinePath.patchValue(this.downtime.confirmedMachinePath);

          this.updateComponentsArray(this.downtime.confirmedMachinePath);
        } else {
          if (this.downtime.assumedMachinePath) {
            this.firstForm.controls.confirmedMachinePath.patchValue(this.downtime.assumedMachinePath);
            this.updateComponentsArray(this.downtime.assumedMachinePath);
          } else {
            this.firstForm.controls.confirmedMachinePath.patchValue(this.machinesArray[0].path);
            this.updateComponentsArray(null);
          }
        }

    });


    this.downtimeService.getDowntimesReasons().then(reasons => {
      this.reasonsArray = [...reasons];
      if (this.downtime.confirmedReasonId) {
        this.thirdForm.controls.confirmedReasonId.patchValue('' + this.downtime.confirmedReasonId);
      } else {
        if (this.downtime.assumedReasonId) {
          this.thirdForm.controls.confirmedReasonId.patchValue('' + this.downtime.assumedReasonId);
        }
      }
    });

    if (this.downtime.notes) {
      this.thirdForm.controls.notes.patchValue(this.downtime.notes);
    }
  }

  compare(confirmedMachinePathValue, machinePath) {
    if( confirmedMachinePathValue === machinePath ||
        (
          confirmedMachinePathValue === null &&
          machinePath === ''
        )
    ) {
      return true;
    }
    return false;
  }


  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

}
