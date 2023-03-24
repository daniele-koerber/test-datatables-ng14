import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';

import { ConfigService, ApiService } from './';
import { SchedulingData } from '../../../@core/data/scheduling';
import { ConfigurationData } from '../../../@core/data/configuration';
import {TranslateService} from '@ngx-translate/core';

import { Observable, EMPTY, pipe } from 'rxjs';
import { TimestampObservableCache } from '../models/timestamp-observable-cache.model';
import { shareReplay, catchError } from 'rxjs/operators';


@Injectable()
export class FacadeService  {

  cache: { [id: string]: TimestampObservableCache<any> };

  constructor(
    private config: ConfigService,
    private api: ApiService,
    private toastService: NbToastrService,
    public translate: TranslateService,
    private schedule: SchedulingData,
    private configuration: ConfigurationData,
  ) {
    this.cache = {};
  }

  configFE = {
    service: 'configFE',
    getTimedUpdateMs: (params = null) => {
      const fnName = `${this.configFE.service}.${this.configFE.getTimedUpdateMs.name}`;
      if (this.getCacheItem(fnName, params)) {
        console.log('Retrieved item from cache');
        return this.getCacheItem(fnName, params);
      }

      console.log('real call');
      const res = this.config.getTimedUpdateMs() as unknown as Observable<number>;
      pipe(
        shareReplay(1),
        catchError(err => {
          this.deleteCacheItem("getTimedUpdateMs", params);
          return EMPTY;
        })
      );

      this.setCacheItem(fnName, params, res);

    return res;

    }
  };

  configurationFE = {
    getSelectedProcessCell: () => { return this.configuration.getSelectedProcessCell() },
    hasSelectedProcessCellChanged: this.configuration.hasSelectedProcessCellChanged,
    hasComponentLoaded: this.configuration.hasComponentLoaded
  };

  scheduleFE = {
    getNextBatches: (path, index, count) => { return this.schedule.getNextBatches(path, index, count) },
  };

  /**
  * CACHE
  */

  getCacheItem(key: string, params): Observable<any> {
    const cacheItem = this.cache[key+JSON.stringify(params)];
    if (!cacheItem) { return null; }
    if (cacheItem.expires <= Date.now()) {
      this.deleteCacheItem(key, params);
      return null;
    }
    return cacheItem?.observable;
  }

  setCacheItem(key: string, params, value: Observable<any>): void {
    const EXPIRES = Date.now() + (1000 * 60 * 60) / 2;
    this.cache[key+JSON.stringify(params)] = { expires: EXPIRES, observable: value } as TimestampObservableCache<any>;
  }

  deleteCacheItem(key: string, params) {
    delete this.cache[key+JSON.stringify(params)];
  }

}
