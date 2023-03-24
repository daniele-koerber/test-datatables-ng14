import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable(
  {
  providedIn: 'root',
}
)

export class ApiService {

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  get(url) {
    return this.httpClient.get<any>(url, {});
  }
  download(url) {
    return this.httpClient.get(url, {responseType: 'blob'});
  }

  post(url, data) {
    return this.httpClient.post<any>(url, data, {});
  }

  put(url, data) {
    return this.httpClient.put<any>(url, data, {});
  }
  delete(url) {
    return this.httpClient.delete<any>(url, {});
  }
}
