import { Injectable } from '@angular/core';
import { registerLocaleData } from '@angular/common';

import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';

@Injectable({ providedIn: 'root' })

export class SessionService {

    private _locale: string;

    set locale(value: string) {
        this._locale = value;
    }
    get locale(): string {
        return this._locale || 'en-US';
    }

    registerCulture(culture: string) {
        if (!culture) {
            return;
        }
        this.locale = culture;

        
    let locale;
    switch (this.locale) {
      case 'it':
        locale = localeIt
      break;
      case 'es':
        locale = localeEs
      break;
      default:
        locale = localeEn
      break;
    }
    registerLocaleData(locale, this.locale);
    }
}
