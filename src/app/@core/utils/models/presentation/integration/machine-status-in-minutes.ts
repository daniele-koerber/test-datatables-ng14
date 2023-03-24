import { MachineStatusInMinutes_BE } from "../../backend/integration/machine-status-in-minutes";

export interface MachineStatusInMinutes extends MachineStatusInMinutes_BE {
  serverError?: boolean;
  isLoading?: boolean;
}
