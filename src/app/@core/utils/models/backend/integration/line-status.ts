export interface LiveDataCurrent {
    name?: string;
    description?: string;
    uom?: string;
    value?: number;
}

export interface Response {
    machineName?: string;
    machinePath?: string;
    machineStatusName?: string;
    machineStatusValue?: number;
    machinePercX?: number;
    machinePercY?: number;
    sizePerc?: number;
    iconPath?: string;
    linkedMachinesName?: string[];
    depth?: number;
    isInUse?: boolean;
    hasLiveData?: boolean;
    hasProductionCounter?: boolean;
    hasStatusInfo?: boolean;
    labelUp?: boolean;
    machineSpeed?: number;
    machineUoM?: string;
    liveDataCurrent?: LiveDataCurrent[];
    isReferenceSpeedForUnit?: boolean;
    isInAlarm?:boolean;
    alarmCode?:string;
    alarmName?:string;
}

export interface LineStatus {
    timeSeriesQueries?: string[];
    start?: Date;
    end?: Date;
    isRelative?: boolean;
    response?: Response[];
    isOrderActive?: boolean;
    currentSpeed?: number;
    setpointSpeed?: number;
    uoM?: string;
}