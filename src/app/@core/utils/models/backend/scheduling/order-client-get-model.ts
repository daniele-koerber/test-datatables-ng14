export interface AdditionalInformationJsonObject {
    additionalProp1: string[];
    additionalProp2: string[];
    additionalProp3: string[];
}

export interface OrderClientGetModel_BE {
    productionOrder: string;
    productCode: string;
    quantity: number;
    importDatetime: Date;
    processCellPaths: string[];
    status: number;
    statusValue: string;
    isFromErp: boolean;
    additionalInformation: string;
    additionalInformationJsonObject: AdditionalInformationJsonObject;
}