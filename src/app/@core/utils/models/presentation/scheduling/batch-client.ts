import { BatchClient_BE } from "../../backend/scheduling/batch-client";

export interface BatchClient extends BatchClient_BE {
    goodCount: number;
    rejectedCount: number;
    lostCount: number;
    defectiveCount: number;
}

