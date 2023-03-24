export interface AlarmSummary_BE {
  id?: number;
  start?: string;
  end?: string;
  isRelative?: boolean;
  response?: Array<AlarmDetails>;
}
export interface AlarmSummaryOccurences {
  id?: number;
  alarmId?: number;
  duration?: number;
  durationString?: string;
  machineName?: string;
  machinePath?: string;
  name?: string;
  occurrences?: number;
  occurrenciesList?: Array<AlarmHeldOccurencies>;
}
export interface AlarmDetails {
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

