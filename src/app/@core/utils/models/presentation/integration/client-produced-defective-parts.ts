import { ClientProducedDefectiveParts_BE } from "../../backend/integration/client-produced-defective-parts";

export interface ClientProducedDefectiveParts extends ClientProducedDefectiveParts_BE {
    timeSeriesStart?: Date
}
