
export interface LiveData_BE {
    timeSeriesQueries?: string[];
    machinesLiveData?: MachinesLiveData[];
}

export interface Value {
    time?: number;
    informationValue?: number;
}

export interface LiveDataDetail {
    name?: string;
    description?: string;
    uom?: string;
    values?: Value[];
}

export interface MachinesLiveData {
    machineName?: string;
    liveData?: LiveDataDetail[];
}

export interface MachineLiveData_BE {
    timeSeriesQueries?: string[];
    liveData?: LiveDataDetail[];
}
