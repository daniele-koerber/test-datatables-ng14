import { OrderClientGetModel_BE } from "../../backend/scheduling/order-client-get-model";

export interface OrderClientGetModel extends OrderClientGetModel_BE {
    processCellNamesArray: string[],
    processCellNames: string
}