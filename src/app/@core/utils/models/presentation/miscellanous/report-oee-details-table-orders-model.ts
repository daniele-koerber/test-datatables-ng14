export interface ReportOEEDetailsTableOrdersModel{
    code: string;
    name: string;
    isParent: boolean;
    hasNoCompliantQualityChecks: boolean;
    startTime: string;
    endTime: string;
    processCell: string;
    processCellPath: string;
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    targetPieces: number;
    goodPieces: number;
    defectivePieces: number;
    uom: string;
    childrens: ReportOEEDetailsTableOrdersModel[];
}