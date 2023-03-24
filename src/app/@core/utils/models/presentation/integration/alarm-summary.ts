import { AlarmSummary_BE, AlarmSummaryOccurences } from '../../backend/integration/alarm-summary';

export interface AlarmSummary extends AlarmSummary_BE {
  chartData?: AlarmSummaryOccurences[],
  dateStart?: string,
  dateEnd?: string,
  maxTot?: number,
  rowNumberToShow?: number,
  alarmDescription?: string,
  status?: string
}