export interface MachinesStatusHistory_BE { 
    timeSeriesQueries?: Array<string>;
    start?: Date;
    end?: Date;
    isRelative?: boolean;
    machineStatuses?: MachineStatus;
}

export interface MachineStatus { 
    machineOrComponentPath?: string;
    machineOrComponentName?: string;
    isInUse?: boolean;
    statuses?: Array<StatusModel>;
}

export interface StatusModel { 
    start?: Date;
    end?: Date;
    status?: string;
    statusValue?: number;
    alarmId?: number;
    alarmText?: string;
    duration?: number;
}