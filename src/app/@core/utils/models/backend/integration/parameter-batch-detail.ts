export interface ParameterBatchDetail_BE {
    batchParameters?: BatchParameter[];
    timeSeriesQueries?: string[],
    start?: string,
    end?: string,
    isRelative?: boolean;
}

export interface BatchParameter{
    value?: string;
    modifier?: string;
    updatedOn?: string;
}