export interface OEE_BE {
  id?: number;
  resultAvailabilityPercentage?: number;
  resultOverallPercentage?: number;
  resultQualityPercentage?: number;
  resultPerformancePercentage?: number;
  totalPieces?: number;
  goodPieces?: number;
  rejectedPieces?: number;
  idealPieces?: number;
  lostPieces?: number;
  disableTotalAutomaticCalculation?: boolean;
  operatingTime?: number;
  plannedProductionTime?: number,
  operatingTimeTs?: string,
  plannedProductionTimeTs?: string,
  doesMachineHaveProductionCounters?: boolean,
  numberOfBatches?: number,
  consideredTimeRange?: {
      id?: number;
      startTimestamp?: string;
      endTimestamp?: string;
      totalDuration?: string;
  },
  uoM?: string;
}
