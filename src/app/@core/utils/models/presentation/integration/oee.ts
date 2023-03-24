import { OEE_BE } from "../../backend/integration/oee";

export interface OEE extends OEE_BE {
  OEEPercentageRounded?: number;
  availabilityPercentageRounded?: number;
  performancePercentageRounded?: number;
  qualityPercentageRounded?: number;
  dateEnd?: number,
  dateStart?: number,
  status?: string,
}
