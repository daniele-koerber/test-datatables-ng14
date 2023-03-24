export interface ShiftClient_BE {
  shiftDate?: Date;
  shiftStartDatetime?: Date;
  shiftEndDatetime?: Date;
  shiftProgressTime?: string;
  shiftProgressTimeTicks?: number;
  slotId?: number;
  teamId?: number;
  effectiveTeamId?: string;
  effectiveTeamName?: string;
  teamName?: string;
  isTeamOverriden?: boolean;
  overrideTeamId?: number;
  overrideTeamName?: string;
  teamColor?: string;
  overrideTeamColor?: string;
}


