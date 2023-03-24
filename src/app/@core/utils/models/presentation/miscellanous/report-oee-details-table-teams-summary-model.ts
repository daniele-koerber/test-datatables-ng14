export interface ReportOEEDetailsTableTeamsSummaryModel{
    id: number;
    name: string;
    //isParent: boolean;
    color: string;
    // startTime: string;
    // endTime: string;
    // processCell: string;
    // processCellPath: string;
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    targetPieces: number;
    goodPieces: number;
    defectivePieces: number;
    uom: string;
    //childrens: ReportOEEDetailsTableTeamsSummaryModel[];
}