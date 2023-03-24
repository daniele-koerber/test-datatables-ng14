import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { switchMap } from 'rxjs/operators';
import { KeycloakAuthGuard, KeycloakEventType, KeycloakService } from 'keycloak-angular';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    private authService: NbAuthService;

    constructor(
      private injector: Injector,
      protected readonly keycloak: KeycloakService,
      ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      this.authService = this.injector.get(NbAuthService);
      if (request.url.includes('/token')) {         // Token request on login
        return next.handle(request);
      } else {                                      // API calls with JWT Authorization
          const token = localStorage.getItem('keycloak_authToken');
          const JWT = `Bearer ${token}`;
          if(request.url.includes('/teamassignment/overrides/import')) {
            request = request.clone({
              setHeaders: {
                'Accept': 'application/json',
                Authorization: JWT,
              },
            });
          } else if(request.url.includes('/availabletimeslot')) {
            request = request.clone({
              setHeaders: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: JWT,
              },
            });
          } else {
            if(request.url.includes('openid-connect/logout')) {
              request = request.clone({
                setHeaders: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  Authorization: JWT,
                },
              });
            } else {
              request = request.clone({
                setHeaders: {
                  'Content-Type' : 'application/json',
                  Authorization: JWT,
                },
              });
            }
          }
          return next.handle(request);
      }
    }
}
