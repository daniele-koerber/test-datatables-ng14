import { Component, OnDestroy, OnInit, AfterViewInit, Input } from '@angular/core';
import { NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ExportWorkerData } from '../../../@core/data/exportworker';
import { LayoutService } from '../../../@core/utils/services';
import { ConfigService } from '../../../@core/utils/services/config.service'
import { map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import {TranslateService} from '@ngx-translate/core';



@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {

  private destroy$: Subject<void> = new Subject<void>();
  public readonly materialTheme$: Observable<boolean>;
  userPictureOnly: boolean = false;
  user: any;
  enterpriseLogo;
  hideSelect = false;
  selectedlanguage;
  availableLanguages;

  link = '#';

  userMenu = [ { title: 'Log out', link: 'auth/logout' } ];

  public constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private authService: NbAuthService,
    public translate: TranslateService,
    private router:Router,
    private route: ActivatedRoute,
    private config: ConfigService,
    private exportWorkerService: ExportWorkerData,
  ) {
    const self = this;

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      self.user = { name: payload.username, picture: './assets/images/user.png' };
    });

    this.materialTheme$ = this.themeService.onThemeChange()
      .pipe(map(theme => {
        const themeName: string = theme?.name || '';
        return themeName.startsWith('material');
      }));

    this.menuService.onItemClick()
      .subscribe((event) => {
        this.router.navigate([event.item.link]);
      });

    this.selectedlanguage = this.config.getSelectedLanguage();
    this.availableLanguages = this.config.getLanguages();
  }

  ngOnInit() {
    this.layoutService.changeLayoutSize();
    this.enterpriseLogo = '../../../../assets/images/enterprises/Koerber_Logo_RGB_Black.png';
    // this.userService.getUsers()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((users: any) => this.user = users.nick);
  }

  changePage(title: string) {
   this.link = this.userMenu.find(el => el.title.toLocaleLowerCase() === title.toLocaleLowerCase())?.link;
    if (this.link !== undefined && this.link !== null) {
      this.router.navigate([this.link]);
    }
  }
  
  changeUserSettings() {
    this.link = this.config.getUserSettingsPageLinkDestination();
    window.open(this.link, "_blank");    
  }

  openHelp () {
    this.link = this.config.getHelpPageLinkDestination();
    if(this.link && this.link!=='#') { window.open(this.link, "_blank");}
  }

  ngAfterViewInit() {
    const page = location.pathname.split('/').pop();
    this.hideSelect = (page === 'product-definition' || page === 'details' || page === 'report' ? true : false);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const page = location.pathname.split('/').pop();
        this.hideSelect = (page === 'product-definition' || page === 'details' || page === 'report' ? true : false);
      }
    });
  }

  languageSelected(event) {
    const lk = event.value;
    this.selectedlanguage = this.availableLanguages.find(l => l.key === lk);
    this.config.setAndUpdate(this.selectedlanguage);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();
    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
