import { CalendarTimeSlotWOrderTime_BE } from "./calendar-time-slot-workorder-time";

export interface CalendarTimeSlotWStartStopTimeNearestElements_BE {
    previousElement: CalendarTimeSlotWOrderTime_BE;
    requestedElement: CalendarTimeSlotWOrderTime_BE;
    nextElement: CalendarTimeSlotWOrderTime_BE;
}