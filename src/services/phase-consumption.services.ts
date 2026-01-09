import phaseConsumption from "@/data/phase-consumption.json";

export type PhaseConsumptionData = typeof phaseConsumption;

export async function getPhaseConsumptionData() {

  return phaseConsumption;
}
