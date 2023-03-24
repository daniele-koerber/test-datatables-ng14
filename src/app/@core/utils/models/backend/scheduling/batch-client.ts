export interface BatchClient_BE {
    productionOrder?: string;
    productCode?: string;
    productDescription?: string;
    processCellPath?: string[];
    status?: number;
    version?: number;
    targetQuantity?: number;
    unitPath?: string;
    uom?: string;
    canStart?: boolean;
    batchExpectedStart?: Date;
    batchExpectedEnd?: Date;
    timeSeriesStart?: Date;
    timeSeriesEnd?: Date;
    batchDuration?: number;
    parametersModified?: boolean;
    type?: number;
    statusValue?: string;
}