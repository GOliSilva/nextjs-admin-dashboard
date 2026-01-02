import { getPhaseConsumptionData } from "@/services/phase-consumption.services";
import { OverviewCardsClient } from "./cards-client";

const BASE_VOLTAGE = 220;
const MAX_DEVIATION_RATIO = 0.1;

const getVoltageColor = (value: number) => {
  const ratio = Math.abs(value - BASE_VOLTAGE) / BASE_VOLTAGE;
  const clamped = Math.min(ratio, MAX_DEVIATION_RATIO);
  const hue = 120 - (clamped / MAX_DEVIATION_RATIO) * 120;

  return `hsl(${hue} 80% 40%)`;
};

const formatVoltage = (rawValue: string) => {
  const numeric = Number.parseFloat(rawValue);

  if (!Number.isFinite(numeric)) {
    return {
      value: rawValue,
      indicatorValue: rawValue,
      indicatorIsDecreasing: false,
      indicatorStyle: undefined,
    };
  }

  const percent = (numeric / BASE_VOLTAGE) * 100;

  return {
    value: `${numeric.toFixed(2)} V`,
    indicatorValue: `${percent.toFixed(1)}%`,
    indicatorIsDecreasing: numeric < BASE_VOLTAGE,
    indicatorStyle: { color: getVoltageColor(numeric) },
  };
};

type OverviewCardsGroupProps = {
  compact?: boolean;
};

export async function OverviewCardsGroup({
  compact,
}: OverviewCardsGroupProps) {
  const phaseConsumption = await getPhaseConsumptionData();
  const tensaoA = formatVoltage(phaseConsumption.TensaoA);
  const tensaoB = formatVoltage(phaseConsumption.TensaoB);
  const tensaoC = formatVoltage(phaseConsumption.TensaoC);

  // Build cards data array
  const cardsData = [
    {
      label: "Tensão A",
      value: tensaoA.value,
      indicatorValue: tensaoA.indicatorValue,
      indicatorIsDecreasing: tensaoA.indicatorIsDecreasing,
      indicatorStyle: tensaoA.indicatorStyle,
      iconName: "VoltageA" as const,
    },
    {
      label: "Tensão B",
      value: tensaoB.value,
      indicatorValue: tensaoB.indicatorValue,
      indicatorIsDecreasing: tensaoB.indicatorIsDecreasing,
      indicatorStyle: tensaoB.indicatorStyle,
      iconName: "VoltageB" as const,
    },
    {
      label: "Tensão C",
      value: tensaoC.value,
      indicatorValue: tensaoC.indicatorValue,
      indicatorIsDecreasing: tensaoC.indicatorIsDecreasing,
      indicatorStyle: tensaoC.indicatorStyle,
      iconName: "VoltageC" as const,
    },
    {
      label: "Potência",
      value: `${phaseConsumption.Potenciadireta} W`,
      hideIndicator: true,
      iconName: "Power" as const,
    },
  ];

  return <OverviewCardsClient cards={cardsData} />;
}
