import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NbAuthJWTToken, NbAuthService, NbAuthStrategy, NbTokenService } from '@nebular/auth';
import { KeycloakAuthGuard, KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { ConfigService } from './config.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthGuardService extends KeycloakAuthGuard implements CanActivate {

  constructor(private authService: NbAuthService,
              protected readonly router: Router,
              protected readonly keycloak: KeycloakService,
              private tokenService: NbTokenService,
              private config: ConfigService
              ) {
    super(router, keycloak);
  }

  async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const BASE_URL = this.config.getBaseServerUrl();
    let keycloak_config = JSON.parse(sessionStorage.getItem('keycloak_config'));

    const urlPathArr = document.location.pathname.split('/');
    const projectPath = urlPathArr[1];
    const currentLocation = window.location.pathname;
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: `${document.location.origin}/${currentLocation}`
      }).then(() => {

        const refreshToken = this.keycloak.getKeycloakInstance().refreshToken;
        const authToken = this.keycloak.getKeycloakInstance().token;
        localStorage.setItem('keycloak_refreshToken', refreshToken)
        localStorage.setItem('keycloak_authToken', authToken)
      });

    } else {

      const refreshToken = this.keycloak.getKeycloakInstance().refreshToken;
      const authToken = this.keycloak.getKeycloakInstance().token;
      localStorage.setItem('keycloak_refreshToken', refreshToken)
      localStorage.setItem('keycloak_authToken', authToken)
    }
    this.keycloak.keycloakEvents$.subscribe({
      next: (e) => {
        if (e.type == KeycloakEventType.OnTokenExpired) {
          this.keycloak.updateToken(20).then(() => {

            const refreshToken = this.keycloak.getKeycloakInstance().refreshToken;
            const authToken = this.keycloak.getKeycloakInstance().token;
            localStorage.setItem('keycloak_refreshToken', refreshToken)
            localStorage.setItem('keycloak_authToken', authToken)
          });

        }
      }
    });

    await this.afterInit();
    return this.authenticated;
  }

  async afterInit() {
    return new Promise<void>(async (res,rej)=>{
      this.keycloak.getToken().then((token)=> {
        var JWTToken = new NbAuthJWTToken (token,"TMom");
        this.tokenService.set(JWTToken);
        res();
      })
    });
  }

}
