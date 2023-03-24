import { Injectable } from '@angular/core';
import { ParametersData } from '../data/parameters';
import { ConfigService, ApiService } from '../utils/services';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class ParametersService extends ParametersData {

  parametersServerUrl: string;
  lang

  constructor(
    private config: ConfigService,
    private api: ApiService,
    public translate: TranslateService,
  ) {
    super();
    this.parametersServerUrl = this.config.getParametersServerUrl();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang)
  }
//TEST PUSH
  getProductsDefinitionList() {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/productdefinitions/lastversion`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });

    return promise;
  }

  getProductDefinitionById(id) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/productdefinitions/${id}`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  updateProductDefinitionById(definition,updatePlannedBatches:boolean,updateRunningBatch:boolean) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/productdefinitions/${definition.id}/update?updatePlannedBatches=${updatePlannedBatches ? updatePlannedBatches : false}&updateRunningBatch=${updateRunningBatch ? updateRunningBatch : false}`;
      this.api.put(url, definition)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  duplicateProductDefinitionById(obj, definition) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/productdefinitions/duplicate?productDefinitionId=${obj.id ? obj.id : ''}`;
      this.api.post(url, definition)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  getBatchParameters(productCode, processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/productdefinitions/${productCode}/batchParameters/${processCellPath}`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  getProducts(processCellPath){
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/processcells/${processCellPath}/productdefinitions`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  getIdentifiers() {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/productdefinitions/identifiers`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  getControlRecipe(unit, productionOrder) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/units/${unit.path}/productionorders/${productionOrder}/controlrecipe`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  //post parameters/controlrecipes/{controlRecipeId}/update
  updateControlRecipe(data, controlRecipeId) {
    const promise = new Promise((resolve, reject) => {
      const params = data;
      const url = `${this.parametersServerUrl}${this.lang}/controlrecipes/${controlRecipeId}/update`;
      this.api.put(url, params)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  deleteProductDefinition (productDefinitionId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.parametersServerUrl}${this.lang}/productdefinitions/${productDefinitionId}/delete`;
      this.api.delete(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }
}
