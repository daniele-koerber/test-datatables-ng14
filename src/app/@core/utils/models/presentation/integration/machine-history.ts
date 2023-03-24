import { ClientAggregatedMachineHistory } from "../../backend/integration/machine-history";

export interface AggregatedMachineHistoryResponse_FE {
  timeSeriesQueries?: Array<string>;
  start?: Date;
  end?: Date;
  isRelative?: boolean;
  machinesHistory?: ClientAggregatedMachineHistory;
  serverError?: boolean;
  isLoading?: boolean;
  noData?: boolean;
  status?: string;
}





export interface MachineSpeed_FE {
  time?: Date;
  date?: number;
  speed?: number;
  underspeed?: number;
  setPoint?: number;
}

export interface MachineParameterSpeed_FE {
  time?: Date;
  date?: number;
  speed?: number;
}


export interface ProgressiveMachineProductionCounter_FE {
  time?: Date;
  date?: number;
  production?: number;
}

export interface AlarmHeldOccurencies_FE {
  alarmStart?: Date;
  alarmEnd?: Date;
  duration?: number;
  durationString?: string;
  name?: string;
  machineName?: string;
  machinePath?: string;
  dateTime?: string;
  speed?: number;
  date?: number;
}
