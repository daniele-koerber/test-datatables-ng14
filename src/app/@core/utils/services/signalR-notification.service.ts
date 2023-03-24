import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SignalRNotificationService {
  private valueSource = new BehaviorSubject(null);
  signalR_Listener = this.valueSource.asObservable();
  signalR_Emit(value) {this.valueSource.next(value)}
}

