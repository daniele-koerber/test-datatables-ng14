/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, HostListener } from '@angular/core';
import { AnalyticsService } from './@core/utils/services/analytics.service';
import { SeoService } from './@core/utils/services/seo.service';
import { TEXAS_ICON_PACK } from '../assets/icons/icons_pack';
import { NbIconLibraries } from '@nebular/theme';
import * as am4core from '@amcharts/amcharts4/core';
import * as am5 from "@amcharts/amcharts5";
import { Subject } from 'rxjs';
import { ConfigService } from './@core/utils/services/config.service';

@Component({
  selector: 'ngx-app',
  // template: `<kds-button>test</kds-button>`,
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {

  userActivity;
  userInactive: Subject<any> = new Subject();

  constructor(
    private analytics: AnalyticsService, 
    private seoService: SeoService,
    private iconLibraries: NbIconLibraries,
    private configService: ConfigService,
    ) {
    am4core.addLicense('CH252853607');
    am5.addLicense("AM5C252853607");
    this.iconLibraries.registerSvgPack('texas', TEXAS_ICON_PACK);

    this.setTimeout();
    this.userInactive.subscribe(() => { window.location.reload(); });
  }

  setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), this.configService.getInactiveRefreshTime());
  }

  @HostListener('window:mousemove') refreshMouse() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  @HostListener('document:keydown', ['$event']) refreshKeyboard() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();

    this.configService.checkDomain(document.location);
  }
}
