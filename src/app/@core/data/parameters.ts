export abstract class ParametersData {

  getProducts(processCellPath: string): any {
    throw new Error('Method not getProducts.');
  }

  getIdentifiers(): any {
    throw new Error('Method not getProducts.');
  }

  getProductsDefinitionList(): any {
    throw new Error('Method not implemented.');
  }

  getBatchParameters(productCode, processCellPath): any {
    throw new Error('Method not implemented.');
  }

  getProductDefinitionById(productId: any): any {
    throw new Error('Method not implemented.');
  }
  updateProductDefinitionById(definition: any,updatePlannedBatches:boolean,updateRunningBatch:boolean): any {
    throw new Error('Method not implemented.');
  }
  deleteProductDefinition(productDefinitionId: any): any {
    throw new Error('Method not implemented.');
  }
  duplicateProductDefinitionById(obj: any, definition: any): any {
    throw new Error('Method not implemented.');
  }
  getControlRecipe(unitPath: string, productionOrder: string): any {
    throw new Error('Method not implemented.');
  }
  updateControlRecipe(data: any, controlRecipeId: any): any {
    throw new Error('Method not implemented.');
  }
}
