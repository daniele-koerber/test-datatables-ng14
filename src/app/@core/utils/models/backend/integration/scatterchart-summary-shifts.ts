
export interface shiftsOEE_BE {
  "changeLostWithoutAffectingTotals": boolean,
  "resultAvailabilityPercentage":  number,
  "resultPerformancePercentage":  number,
  "resultQualityPercentage":  number,
  "resultOverallPercentage": number,
  "operatingTime": number,
  "plannedProductionTime":  number,
  "operatingTimeTs": String,
  "plannedProductionTimeTs": String,
  "orderTargetPieces": number,
  "totalPieces": number,
  "goodPieces": number,
  "rejectedPieces": number,
  "idealPieces":  number,
  "lostPieces": number,
  "doesMachineHaveProductionCounters": boolean,
  "numberOfBatches": number,
  "consideredTimeRange": String,
  "uoM": String
}

export interface ScatterChartSummaryShifts_BE {
  "shiftsOEE": shiftsOEE_BE,
  "teamName": String,
  "teamColor": String,
}

