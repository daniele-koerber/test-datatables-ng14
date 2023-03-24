
export interface ClientAggregatedMachineHistoryResponse {
  timeSeriesQueries?: Array<string>;
  start?: Date;
  end?: Date;
  isRelative?: boolean;
  machinesHistory?: ClientAggregatedMachineHistory;
}


export interface ClientAggregatedMachineHistory {
  machinePath?: string;
  machineName?: string;
  machineSpeeds?: ClientMachineSpeed;
  alarmsResponse?: Array<ClientAlarmDetails>;
  productionCounter?: Array<ProgressiveMachineProductionCounter>;
}

export interface ProgressiveMachineProductionCounter {
  time?: Date;
  production?: number;
}

//#region  AlarmDetails
export interface ClientAlarmDetails {
  machinePath?: string;
  machineName?: string;
  alarmId?: number;
  name?: string;
  duration?: number;
  durationString?: string;
  occurrences?: number;
  occurrencesList?: Array<AlarmHeldOccurencies>;
}
export interface AlarmHeldOccurencies {
  alarmStart?: Date;
  alarmEnd?: Date;
  duration?: number;
  durationString?: string;
}
//#endregion





//#region MachineSpeed
export interface ClientMachineSpeed {
  machinePath?: string;
  machineName?: string;
  uoMValue?: string;
  isInUse?: boolean;
  machineSpeeds?: Array<MachineSpeed>;
  parameterSpeeds?: Array<MachineParameterSpeed>;
}
export interface MachineSpeed {
  time?: Date;
  speed?: number;
  setPoint?: number;
}

export interface MachineParameterSpeed {
  time?: Date;
  speed?: number;
}
//#endregion



