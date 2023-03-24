export interface ReportOEEDetailsTableTeamsModel{
    name: string;
    isParent: boolean;
    hasNoCompliantQualityChecks: boolean;
    color: string;
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
    childrens: ReportOEEDetailsTableTeamsModel[];
}