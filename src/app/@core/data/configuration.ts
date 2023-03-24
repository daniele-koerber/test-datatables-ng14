
export abstract class ConfigurationData {
  hasComponentLoaded;
  hasSelectedProcessCellChanged;

  getEnterprises(): any {
    throw new Error('Method not implemented.');
  }
  getSites(enterpriseId: number): any {
    throw new Error('Method not implemented.');
  }
  getAreas(site: number): any {
    throw new Error('Method not implemented.');
  }
  getProcessCell(path: string): any {
    throw new Error('Method not implemented.');
  }
  resetSelectedProcessCell(): any {
    throw new Error('Method not implemented.');
  }
  getProcessCells(area: number): any {
    throw new Error('Method not implemented.');
  }
  getUnits(processCell: number): any {
    throw new Error('Method not implemented.');
  }
  getMachines(processCellPath: any): any {
    throw new Error('Method not implemented.');
  }
  getMachineByMachinePath(machinePath: string): any {
    throw new Error('Method not implemented.');
  }
  getMachineNameByMachinePath(machinePath: string): any {
    throw new Error('Method not implemented.');
  }
  getComponentByComponentPath(componentPath: string): any {
    throw new Error('Method not implemented.');
  }
  getCustomSettings(): any {
    throw new Error('Method not implemented.');
  }
  buildCustomSettings(): any {
    throw new Error('Method not implemented.');
  }
  buildPlantHierarchy(): any {
    throw new Error('Method not implemented.');
  }
  forceDisplayGroupCheck(): any {
    throw new Error('Method not implemented.');
  }
  getFIlteredDisplayGroup(): any {
    throw new Error('Method not implemented.');
  }
  canBypassDisplayGroup(): any {
    throw new Error('Method not implemented.');
  }
  getDisplayGroupsByProcessCellPath(path: string): any {
    throw new Error('Method not implemented.');
  }
  getDisplayGroups(): any {
    throw new Error('Method not implemented.');
  }
  checkDisplayGroupPermissionsAndBuildHierarchy(): any {
    throw new Error('Method not implemented.');
  }
  getPlantHierarchy(): any {
    throw new Error('Method not implemented.');
  }
  setSelectedProcessCell(value: number): any {
    throw new Error('Method not implemented.');
  }
  getSelectedProcessCell(): any {
    throw new Error('Method not implemented.');
  }
  getProcessCellsArray(): any {
    throw new Error('Method not implemented.');
  }
  getUnitArray(): any {
    throw new Error('Method not implemented.');
  }
  getUnitByProcessCellPath(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  getUoMByProcessCellPath(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  getLiveDataByProcessCellPath(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
}
