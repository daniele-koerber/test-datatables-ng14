import { Component, OnInit } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';
import { NbMenuService } from '@nebular/theme';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import {TranslateService} from '@ngx-translate/core';
import { NbIconLibraries } from '@nebular/theme';
import { ConfigurationService } from '../@core/mock/configuration.service';
import { ConfigService } from './../@core/utils/services/config.service';

import '@fortawesome/fontawesome-pro/js/all.js';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit {

  menu = MENU_ITEMS;
  constructor (
    private authService: NbAuthService,
    private menuService: NbMenuService,
    private config: ConfigService,
    private translate: TranslateService,
    private iconLibraries: NbIconLibraries,
    private configurationService: ConfigurationService,
  ) {

    this.iconLibraries.registerFontPack('solid', {packClass: 'fas', iconClassPrefix: 'fa'});
    this.iconLibraries.registerFontPack('regular', {packClass: 'far', iconClassPrefix: 'fa'});
    this.iconLibraries.registerFontPack('light', {packClass: 'fal', iconClassPrefix: 'fa'});
    this.iconLibraries.registerFontPack('duotone', {packClass: 'fad', iconClassPrefix: 'fa'});
    this.iconLibraries.registerFontPack('brands', {packClass: 'fab', iconClassPrefix: 'fa'});

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();

      const langsArr = config.getLanguages().map(el => el.key);
      translate.addLangs(langsArr);
      translate.setDefaultLang(langsArr[0]);
      const browserLang = translate.getBrowserLang();
      const lang = config.getSelectedLanguage();
      translate.use(lang)
      this.getAuthorizedMenuPagesAndTranslate(payload.features);
    });

    this.menuService.onItemClick().subscribe((el) => {
      if(el.item.title==='CMMS') {
        window.open(this.config.getCMMSUrl(), '_blank');
      }
    });

  }

  async ngOnInit() {
    this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if(loaded) {
        const settings = this.configurationService.getCustomSettings();
        if(settings.CMMS_link_enabled) {
          this.menuService.addItems([{
            title: 'CMMS',
            icon: {
              icon: 'wrench',
              pack: 'light',
            },
            link: '#',
          }]);
        }
      }
    });
  }

  getAuthorizedMenuPagesAndTranslate(featuresList) {
    this.menu.forEach(item => {

      this.translate.get('MENU.' + item.title.replace(' ', '_')).subscribe((text: string) => {

        item.title = text;
      });
      this.checkPagePermissions(item, featuresList);
    });
  }

  checkPagePermissions(menuItem, features) {
    const found = features.filter(item => menuItem.features.includes(item));
    menuItem.hidden = (!(menuItem.features.includes('*') || found.length) ? true : false);
  }

}
