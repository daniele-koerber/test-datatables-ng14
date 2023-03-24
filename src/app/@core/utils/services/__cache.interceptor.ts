import { Injectable } from "@angular/core";

import { Observable } from "rxjs/Rx";
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  HttpEvent,
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpInterceptor
} from "@angular/common/http";

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache: Map<HttpRequest<any>, HttpResponse<any>> = new Map()
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    if(req.method !== "GET") {
        return next.handle(req)
    }
    if(req.headers.get("reset")) {
        this.cache.delete(req)
    }
    const cachedResponse: HttpResponse<any> = this.cache.get(req)
    if(cachedResponse) {
      // console.log('GET ==>', req, this.cache)
        return of(cachedResponse.clone())
    }else {
        return next.handle(req).pipe(
          tap(stateEvent => {
                if(stateEvent instanceof HttpResponse) {
                    this.cache.set(req, stateEvent.clone())
                    // console.log('SET ==>', req, this.cache)
                }
            })
        ) // .share()
    }
  }
}
