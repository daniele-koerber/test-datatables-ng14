import { NbMenuItem } from '@nebular/theme';

export class NbMenuItemWithPermissions extends NbMenuItem {
  features?: Array<string>;
  children?: Array<NbMenuItemWithPermissions> ;
}

export const MENU_ITEMS: NbMenuItemWithPermissions[] = [
  {
    title: 'Overview',
    icon: {
      icon: 'analytics',
      pack: 'light',
    },
    link: '/pages/overview',
    features: ['CanViewOverviewPage'],
  },

  {
    title: 'Product_Definition',
    icon: {
      icon: 'clipboard-list',
      pack: 'light',
    },
    link: '/pages/product-definition',
    features: ['CanViewProductDefinitionPage'],
  },
  {
    title: 'Calendar',
    icon: {
      icon: 'calendar-alt',
      pack: 'light',
    },
    link: '/pages/calendar',
    features: ['CanViewCalendarPage'],
  },
  {
    title: 'Report',
    icon: {
      icon: 'chart-line',
      pack: 'light',
    },
    link: '/pages/report',
    features: ['CanViewReportPage'],
    pathMatch: 'prefix',
  },
  {
    title: 'Settings',
    icon: {
      icon: 'cogs',
      pack: 'light',
    },
    link: '/pages/settings',
    features: ['CanEditQualitySettings',"CanEditCalendarSettings"],
  }
];
