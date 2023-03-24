export interface Status {
    statusValue?: number;
    statusName?: string;
    duration?: number;
    durationSeconds?: number;
}

export interface StatusPerMinutes {
    machineOrComponentPath?: string;
    machineOrComponentName?: string;
    isInUse?: boolean;
    statuses?: Status[];
}

export interface MachineStatusInMinutes_BE {
    timeSeriesQueries?: string[];
    start?: Date;
    end?: Date;
    isRelative?: boolean;
    statusPerMinutes?: StatusPerMinutes;
}
