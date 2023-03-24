export interface SpeedAndSetPoints_BE{
    timeSeriesQueries?: string[];
    start?: Date;
    end?: Date;
    isRelative?: boolean;
    response?: Response[]
}

export interface Response {
    time?: Date;
    actualSpeed?: number;
    setPointSpeed?: number;
}