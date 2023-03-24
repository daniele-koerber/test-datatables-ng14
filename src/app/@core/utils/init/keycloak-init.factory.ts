
import { KeycloakService } from "keycloak-angular";
import { fromPromise } from "rxjs/internal-compatibility";
import { switchMap } from "rxjs/operators";
import { ConfigInitService } from "./config-init.service";

export function initializeKeycloak(
  keycloak: KeycloakService,
  configInitService: ConfigInitService
  ) {
    // return () =>
    //   configInitService.getConfig().subscribe((config) => {
    //     const url = document.location;
    //     if(url.hostname !== 'localhost') {
    //       config["KEYCLOAK_URL"] = url.protocol + '//' + url.hostname;
    //       config["KEYCLOAK_PORT_NUMBER"] = url.port;
    //     }
    //     return fromPromise(
    //       keycloak.init({

    //       config: {
    //         url: `${config?.KEYCLOAK_URL}:${config?.KEYCLOAK_PORT_NUMBER}`,
    //         realm: config['KEYCLOAK_REALM'],
    //         clientId: config['KEYCLOAK_CLIENT_ID'],
    //       },
    //       initOptions: {
    //         checkLoginIframe: false,
    //         promiseType: 'native',
    //         responseMode: 'query'
    //       }
    //     }));
    //   })
    return () =>
      configInitService.getKeycloakConfig()
        .pipe(
          switchMap<any, any>((config) => {
            const url = document.location;
            if(url.hostname !== 'localhost') {
              config["KEYCLOAK_URL"] = url.protocol + '//' + url.hostname;
            }
            return fromPromise(keycloak.init({
              config: {
                url: `${config?.KEYCLOAK_URL}`,
                realm: config['KEYCLOAK_REALM'],
                clientId: config['KEYCLOAK_CLIENT_ID'],
              },
              initOptions: {
                checkLoginIframe: false,
                // promiseType: 'native',
              }
            }))

          })
        ).toPromise()
}
