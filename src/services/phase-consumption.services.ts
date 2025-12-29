import phaseConsumption from "@/data/phase-consumption.json";

export type PhaseConsumptionData = typeof phaseConsumption;

export async function getPhaseConsumptionData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return phaseConsumption;
}
