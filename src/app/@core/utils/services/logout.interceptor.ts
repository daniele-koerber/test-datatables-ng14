import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpResponse, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {NbAuthOAuth2Token, NbAuthService} from '@nebular/auth';
import { ConfigInitService } from "../../../@core/utils/init/config-init.service";
import { fromPromise } from "rxjs/internal-compatibility";
import { tap, switchMap, catchError } from 'rxjs/operators';
import { NbAuthJWTToken, NbAuthResult } from '@nebular/auth';
import {map} from 'rxjs/operators';
import {Observable, throwError, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LogoutInterceptor implements HttpInterceptor {

    constructor(
      private injector: Injector,
      private configService: ConfigInitService,
      private authService: NbAuthService,
      ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const self = this;
    //   if (request.url.includes('logout')) {
    //     let auth_token;
    //     this.authService.getToken().subscribe((token: NbAuthJWTToken) => { auth_token = token.getValue(); });
    //     const refreshToken = localStorage.getItem('keycloak_refreshToken');
    //     const JWT = `Bearer ${auth_token}`;
    //     const CLIENT_ID = JSON.parse(sessionStorage.getItem('keycloak_config')).KEYCLOAK_CLIENT_ID;


    //     const formData = new FormData();
    //     formData.append('client_id', CLIENT_ID);
    //     formData.append('refresh_token', refreshToken);

    //     const nRequest = request.clone({
    //       setHeaders: {
    //         // 'Content-Type': 'multipart/form-data',
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Accept': 'application/json',
    //         Authorization: JWT,
    //       },
    //       headers: request.headers,
    //       // body: {
    //       //   'client_id': CLIENT_ID,
    //       //   'refresh_token': refreshToken
    //       // },
    //       body: formData,
    //     });
    //     console.log(nRequest);
    //     return next.handle(nRequest)
    //       .pipe(
    //         map((event: HttpEvent<any>) => {
    //           if (event instanceof HttpResponse) {
    //             console.log(event)
    //             return event;
    //           }
    //         }),
    //         tap(evt => {
    //             console.log(evt);
    //             return evt;
    //         }),
    //         catchError(e => throwError("error"))
    //       );

    // } else {
      return next.handle(request)
    // }
  }
}
