import { AfterViewInit, Component, ChangeDetectorRef } from '@angular/core';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AppUpdateService, LayoutService } from '../../../@core/utils/services';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
  <nb-layout windowMode>
  <nb-layout-header subheader>
    <ngx-header>
    </ngx-header>
  </nb-layout-header>

  <nb-sidebar [hidden]='sideBarHidden' class="menu-sidebar" tag="menu-sidebar" responsive>

  <div class="logo-container">
    <a (click)="toggleSidebar()" href="#" class="sidebar-toggle">
      <nb-icon [hidden]="this.isExpanded === false" icon="arrow-ios-back-outline"></nb-icon>
      <nb-icon [hidden]="this.isExpanded === true" icon="arrow-ios-forward-outline"></nb-icon>
    </a>
    <a class="logo" href="#" (click)="navigateHome()">
      <div><img [src]=" enterpriseLogo " style='max-height:50px' /></div>
    </a>
    <div class class="TMOM-text">
      <span style="font-size:16px;font-weight: bold; color: #ffffff;">TMOM</span>
      </div>
  </div>
    <ng-content select="nb-menu"></ng-content>
    <div style="height: initial;
                position: relative;
                display: flex;
                top: 50%;
                width: -webkit-fill-available;
                flex-direction: column;
                align-items: center;">
      <div *ngIf="toUpdate">
        <nb-icon icon="download-outline" style="color: green; font-size: 30px; cursor: pointer;" (click)="updateApp()"></nb-icon>
      </div>
      <div>
        <button (click)="copyToClipboard()" id="version">v {{version}}</button>
        <span  style="font-size:14px; font-style: italic; color: #90887d;"></span>
      </div>
    </div>
  </nb-sidebar>

  <nb-layout-column>
    <ng-content select="router-outlet"></ng-content>
  </nb-layout-column>

  <nb-layout-footer >
    <ngx-footer></ngx-footer>
  </nb-layout-footer>
</nb-layout>
  `,
})

export class OneColumnLayoutComponent implements AfterViewInit {
  user: any;
  enterpriseLogo: string = 'assets/images/enterprises/Koerber_Logo_RGB_White.svg';
  isExpanded: boolean = true;
  sideBarHidden = true;
  version: string = 'dev';
  lastCommit: string = 'dev';
  toUpdate: boolean = false;

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private layoutService: LayoutService,
              private authService: NbAuthService,
              private changeDetectorRef: ChangeDetectorRef,
              private appUpdate: AppUpdateService
  ) {
    this.appUpdate.updateAvailableEvent.subscribe((update) =>{
      this.toUpdate = update;
    });

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanBypassDisplayGroup")) {
        this.sideBarHidden = false;
      }
    });
    const VERSION = require('../../../../assets/settings.json').VERSION;
    const LAST_COMMIT = require('../../../../assets/settings.json').LAST_COMMIT;
    this.version = VERSION;
    this.lastCommit = LAST_COMMIT;

  }

  ngAfterViewInit(): void {

    this.isExpanded = $('.nb-theme-texas nb-sidebar').width() > 100 ? true : false;
    this.changeDetectorRef.detectChanges();
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();
    setTimeout(() => {
    this.isExpanded = $('.nb-theme-texas nb-sidebar').width() > 100 ? true : false;
  }, 0);


    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  copyToClipboard() {
    navigator.clipboard.writeText('Version: '+this.version + '\n Commit:' + this.lastCommit).then(() => {})
  }

  updateApp(){
    location.reload();
  }
}

