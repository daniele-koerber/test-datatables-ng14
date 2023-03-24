import { EventEmitter, Injectable, Output } from '@angular/core';
// import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {

  private updateAvailable: boolean = false;

  @Output() updateAvailableEvent: EventEmitter<boolean> = new EventEmitter();


  private UpdateApp(): void {
    console.info('ngsw: Updating to new version');
    // this.updates.activateUpdate().then(() => {
    //   this.updateAvailable = true;
    //   this.updateAvailableEvent.emit(this.updateAvailable);
    //   console.info("ngsw: New Version Installed! Reload to see the changes");
    // });
  }
}

