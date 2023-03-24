export interface CalendarTimeSlotWOrderTime_BE {
    productionOrder?: string;
    productCode?: string;
    productDescription?: string;
    processCellPath?: string;
    status?: number;
    version?: number;
    targetQuantity?: number;
    unitPath?: string;
    uom?: string;
    canStart?: boolean;
    batchPlannedStart?: Date;
    batchPlannedEnd?: Date;
    batchExpectedStart?: Date;
    batchExpectedEnd?: Date;
    timeSeriesStart?: Date;
    timeSeriesEnd?: Date;
    currentDurationTicks?: number;
    currentDurationHumanized?: string;
    estimatedDurationTicks?: number;
    estimatedDurationHumanized?: string;
}