export interface timeRange_BE  {
  "startTimestamp": String,
  "endTimestamp": String,
  "totalDuration": String
}

export interface itemOEE_BE {
  "changeLostWithoutAffectingTotals": boolean,
  "resultAvailabilityPercentage": number,
  "resultPerformancePercentage": number,
  "resultQualityPercentage": number,
  "resultOverallPercentage": number,
  "operatingTime": number,
  "plannedProductionTime": number,
  "operatingTimeTs": String,
  "plannedProductionTimeTs": String,
  "orderTargetPieces": number,
  "totalPieces": number,
  "goodPieces": number,
  "rejectedPieces": number,
  "idealPieces": number,
  "lostPieces": number,
  "doesMachineHaveProductionCounters": boolean,
  "numberOfBatches": number,
  "consideredTimeRange":timeRange_BE,
  "uoM": String,
  "productCode": String,
  "productDescription": String,
  "hasNoCompliantQualityChecks": boolean,
}

export interface MachinesScatter_BE {
  "machinePath": String,
  "machineName": String,
  "oee": itemOEE_BE
}

export interface ScatterChartOrders_BE {
  "response": Array<itemOEE_BE>,
  "start":String,
  "end": String,
  "isRelative": boolean
}

export interface ScatterChartShifts_BE {
  "response": Array<itemOEE_BE>,
  "start":String,
  "end": String,
  "isRelative": boolean
}

export interface ScatterChartSummaryShifts_BE {
  "shiftsOEE": itemOEE_BE,
  "teamName": String,
  "teamColor": String,
}

