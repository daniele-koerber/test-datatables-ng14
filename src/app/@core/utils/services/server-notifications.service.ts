// import { Injectable } from '@angular/core';
// import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
// import { Subject, Observable } from 'rxjs';
// import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

// import { ConfigService } from '../services/config.service';
// import { ConfigurationData } from '../../../@core/data/configuration';
// import { filter } from '@amcharts/amcharts4/.internal/core/utils/Iterator';


// @Injectable({
//   providedIn: 'any',
// })
// export class ServerNotificationsService {

//   private message$: Subject<any>;
//   private connection: signalR.HubConnection;
//   private displayGroups;

//   constructor(
//     private config: ConfigService,
//     private authService: NbAuthService,
//     private configurationService: ConfigurationData,
//   ) {
//   }

//   public init(topic: any) {
//     console.log('...', this.connection)
//     return new Promise(resolve => {
//       const self = this;
//       this.message$ = new Subject<any>()
//       const url = this.config.getNotificationsUrl(topic);
//       // console.log(url)

//       this.connection = new HubConnectionBuilder().withUrl(url, {
//           skipNegotiation: true,
//           transport: HttpTransportType.WebSockets,
//         },
//       )
//       .build();
//       self.connect();
//       resolve(true);
//     });
//   }

//   // public init(topic: any, processCell: any) {
//   //   return new Promise(resolve => {
//   //     const self = this;
//   //     this.message$ = new Subject<any>()
//   //     const url = this.config.getNotificationsUrl(topic);
//   //     if(processCell?.path) {

//   //     }
//   //   });
//   // }

//   async getDisplayGroups(processCell) {
//     return new Promise(resolve => {
//     const self = this;
//     this.configurationService.canBypassDisplayGroup().then(canBypass=>{
//       this.configurationService.canBypassDisplayGroup().then(canBypass=>{
//           if (canBypass) {
//               this.configurationService.getDisplayGroupsByProcessCellPath(processCell.path).then(displayGroups => {
//                 self.displayGroups = [...displayGroups.map(el => el.name)];
//                 resolve(true);
//               });
//           } else {
//             const fIlteredDisplayGroupID = this.configurationService.getFIlteredDisplayGroup();
//             this.configurationService.getDisplayGroups().then(displayGroups => {
//               const displayGroup = displayGroups.find(el => el.id === fIlteredDisplayGroupID);
//               self.displayGroups = [displayGroup.name];
//               resolve(true);
//             });
//           }
//           // resolve(true);
//         });
//       });
//     });
//   }

//   async subscribeToGroups() {
//     console.log('subscribeToGroups', this.displayGroups, this.connection)
//     const self = this;
//     if (self.displayGroups) {
//       try {
//           await this.connection.invoke("SubscribeToGroups", this.displayGroups);
//       } catch (err) {
//           console.error(err);
//       }
//     }
//   }

//   async unsubscribe() {
//     const self = this;
//     if (self.displayGroups) {
//       try {
//         console.log('Unsubscribe', this.connection)
//         await this.connection.invoke("Unsubscribe");
//       } catch (err) {
//           console.error(err);
//       }
//     }
//   }

//   private connect() {
//     Object.defineProperty(WebSocket, 'OPEN', { value: 1 });
//     this.connection.start()
//     .then(()=>{
//       this.subscribeToGroups();
//     })
//     .catch(err => console.log('==>', err));

//     this.connection.on("DowntimeCountChanged", (message) => {
//       this.message$.next(message);
//     });


//     this.connection.on("QualityCountChanged", (message) => {
//       this.message$.next(message);
//     });

//     this.connection.on("SignalRTestQuality", (message) => {
//       this.message$.next(message);
//     });
//   }

//   public getMessage(): Observable<any> {
//     console.log('getMessage', this.connection)
//     return this.message$;
//   }

//   public disconnect() {
//     this.connection.stop();
//   }
// }
