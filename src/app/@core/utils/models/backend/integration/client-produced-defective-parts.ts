export interface Response {
    time?: Date;
    goodCount?: number;
    rejectedCount?: number;
    lostCount?: number;
    //UoM: string
}

export interface ClientProducedDefectiveParts_BE {
    timeSeriesQueries?: string[];
    start?: Date;
    end?: Date;
    isRelative?: boolean;
    response?: Response;
}
