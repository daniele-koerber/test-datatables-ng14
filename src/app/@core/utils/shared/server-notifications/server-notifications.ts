import { Component, EventEmitter, Input, Output, ElementRef, OnDestroy, OnChanges, SimpleChanges, Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
// import { ServerNotificationsService } from '../../services/server-notifications.service';
import { ConfigService } from '../../services/config.service';

import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigurationData } from '../../../data/configuration';

import { SignalRNotificationService } from '../../services/signalR-notification.service';

@Component({
  selector: 'ngx-server-notifications',
  templateUrl: 'server-notifications.html',
})
export class ServerNotificationsComponent implements OnChanges, OnDestroy {

  @Input() topic: string;
  @Input() from: string;
  @Input() signalRListenersNames: string[];
  @Input() processCell: any;
  @Input() signalRSubscriptionType: string;
  @Output() message: EventEmitter<boolean> = new EventEmitter<boolean>();

  private message$: Subject<any>;
  private connection: signalR.HubConnection;
  private displayGroups;

  private serverSubscription: Subscription;
  public notificationMessage: any;

  // groupSubscriptionName: string = 'group';
  // groupsSubscriptionName: string = 'groups';
  // broadcastSubscriptionName: string = 'broadcast';

  // public topicPerServiceList = {
  //   "Downtime": this.groupsSubscriptionName,
  //   "Quality": this.groupsSubscriptionName,
  //   "Parameters": this.broadcastSubscriptionName,
  //   "Integration": this.groupSubscriptionName,
  //   "Scheduling": this.groupSubscriptionName
  //}

  constructor(
    public element: ElementRef,
    private config: ConfigService,
    private authService: NbAuthService,
    private configurationService: ConfigurationData,
    private signalR: SignalRNotificationService,
  ) {}

  ngOnInit() {
    if(this.topic) {
      this.init(this.topic).then(() => {});
    }
  }

  // private getSubscriptionTypeByServiceName(serviceName: string){
  //   return this.topicPerServiceList[serviceName];
  // }

  async getDisplayGroups(processCell) {
    return new Promise(resolve => {
    const self = this;
    this.configurationService.canBypassDisplayGroup().then(canBypass=>{
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
          if (canBypass) {
              this.configurationService.getDisplayGroupsByProcessCellPath(processCell?.path).then(displayGroups => {
                self.displayGroups = [...displayGroups.map(el => el.name)];
                resolve(true);
              });
          } else {
            const fIlteredDisplayGroupID = this.configurationService.getFIlteredDisplayGroup();
            this.configurationService.getDisplayGroups().then(displayGroups => {
              const displayGroup = displayGroups.find(el => el.id === fIlteredDisplayGroupID);
              self.displayGroups = [displayGroup.name];
              resolve(true);
            });
          }
        });
      });
    });
  }

  /**
   * all the notifications of a topic to a group
   * ('BatchDataChanged', BatchCalendarChanged...)
   * filtered by process cell in listening.
   */
  async subscribeToGroup() {
    if (this.processCell.path){
      try {
        if(this.connection.state !== "Connected") {
          this.init(this.topic)
        }


        await this.connection.invoke("SubscribeToGroup", this.processCell.path);
      } catch (err) {
        // console.error(err);
      }
    }
  }

  /**
   * all the notifications of a topic (Scheduling) to a group
   * ('BatchDataChanged', BatchCalendarChanged...)
   * filtered by a list of displayGroups in listening.
   */
  async subscribeToGroups() {
    const self = this;
    if (self.displayGroups) {
      try {
        if(this.connection.state !== "Connected") {

          this.init(this.topic)
        }
        await this.connection.invoke("SubscribeToGroups", this.displayGroups);
      } catch (err) {
        console.error(err);
        setTimeout(() => {
          this.init(this.topic)
        }, 2000);
      }
    }
  }

  /**
   * all the notifications of a topic (Scheduling) to a list of groups
   * ('BatchDataChanged', BatchCalendarChanged...)
   * to all in listening.
   */
  async subscribeToBroadcast() {
      try {
        if(this.connection.state !== "Connected") {
          this.init(this.topic)
        }
        await this.connection.invoke("SubscribeToBroadcast");
      } catch (err) {
          console.error(err);
          setTimeout(() => {
            this.init(this.topic)
          }, 2000);

      }
  }

  public init(topic: any) {
    return new Promise(resolve => {

      const self = this;
      this.message$ = new Subject<any>()
      const url = this.config.getNotificationsUrl(topic);

      this.connection = new HubConnectionBuilder().withUrl(url+'?from='+this.from, {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        },
      )
      // .configureLogging(0)
      .withAutomaticReconnect()
      .build();
      self.connect();
      resolve(true);
    });
  }

  async unsubscribe() {

    const self = this;
    if (self.displayGroups) {
      try {
        await this.connection.invoke("Unsubscribe");
      } catch (err) {
          console.error(err);
      }
    }
  }

  private connect() {

    Object.defineProperty(WebSocket, 'OPEN', { value: 1 });

    this.connection.start()
    .then(()=>{
        var connectionType = this.signalRSubscriptionType;
        if(connectionType){
          switch(connectionType){
            case this.config.getSignalRGroupSubscriptionType(): {
              this.subscribeToGroup();
              break;
            }
            case this.config.getSignalRGroupsSubscriptionType(): {
              this.getDisplayGroups(this.processCell).then(()=> {
                this.subscribeToGroups();
              })
              break;
            }
            case this.config.getSignalRBroadcastSubscriptionType(): {
              break;
            }
          }
        }
    })
    .catch(err => {
      console.log('Connection notification error==>', err);
    });

    this.connection.onreconnected(() => {
      setTimeout(() =>{
        var connectionType = this.signalRSubscriptionType;
        if(connectionType){
          switch(connectionType){
            case this.config.getSignalRGroupSubscriptionType(): {
              this.subscribeToGroup();
              break;
            }
            case this.config.getSignalRGroupsSubscriptionType(): {
              this.getDisplayGroups(this.processCell).then(()=> {
                this.subscribeToGroups();
              })
              break;
            }
            case this.config.getSignalRBroadcastSubscriptionType(): {
              // this.subscribeToBroadcast();
              break;
            }
          }
        }
      }, 300)
    })

    if (this.signalRListenersNames){
      this.signalRListenersNames.forEach(item => {
        this.connection.on(item, (message) => {
          this.signalR.signalR_Emit(true);
          this.message.emit(message);
        });
      });
    }
  }

  public getMessage(): Observable<any> {
    return this.message$;
  }

  public disconnect() {
    this.connection.stop();
    this.connection= undefined;
  }

  ngOnChanges(changes: SimpleChanges) {
    var connectionType = this.signalRSubscriptionType;

    this.unsubscribe().then(() => {
      if (this.connection.state === 'Connected'){
        if(connectionType){
          switch(connectionType){
            case this.config.getSignalRGroupSubscriptionType():{
                this.subscribeToGroup().then(() => {

                  this.serverSubscription = this.getMessage().subscribe(
                    (message) => {
                     console.log('getSignalRGroupSubscriptionType message =>', message)
                      this.message.emit(message);
                  });
                });
            break;
            }
            case this.config.getSignalRGroupsSubscriptionType():{
              if(this.processCell){
                this.getDisplayGroups(this.processCell).then(()=> {
                  this.subscribeToGroups().then(() => {
                    this.serverSubscription = this.getMessage().subscribe(
                      (message) => {
                       console.log('getSignalRGroupsSubscriptionType message =>', message)
                        this.message.emit(message);
                    });
                  });
                })
              }
              break;
            }
            case this.config.getSignalRBroadcastSubscriptionType():{
                  this.subscribeToBroadcast().then(() => {
                    this.serverSubscription = this.getMessage().subscribe(
                      (message) => {
                        console.log('getSignalRBroadcastSubscriptionType message =>', message)
                        this.message.emit(message);
                    });
                  });
              break;
            }
          }

        }
      }
    })
  }

  ngOnDestroy(): void {
    if(this.serverSubscription){
      this.serverSubscription.unsubscribe()
    }
    this.disconnect();
  }
}
