import { ShiftClient_BE } from "./shift-client";

export interface ShiftClientNearestElements_BE {
    previousElement: ShiftClient_BE;
    requestedElement: ShiftClient_BE;
    nextElement: ShiftClient_BE;
}