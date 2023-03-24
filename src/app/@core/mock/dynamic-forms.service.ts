import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DynamicFormsData } from '../data/dynamic-forms';

interface LooseObject {
  [key: string]: any;
}

@Injectable()
export class DynamicFormsService extends DynamicFormsData {
  constructor(private http: HttpClient) {
    super();
  }

  buildModel(config) {
    const model: LooseObject = {};
    config.map(structure => {
      structure.fieldGroup.map(tab => {
        tab.fieldGroup.map(field => {
          if (field.key !== null && field.templateOptions.value !== null) {
            Object.assign(model, {[field.key]: field.templateOptions.value});
          }
        });
      });
    });
    return model;
  }

}
