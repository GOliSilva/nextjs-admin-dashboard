import { getPhaseConsumptionData } from "@/services/phase-consumption.services";
import { OverviewCard } from "./card";
import * as icons from "./icons";

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

export async function OverviewCardsGroup() {
  const phaseConsumption = await getPhaseConsumptionData();
  const tensaoA = formatVoltage(phaseConsumption.TensaoA);
  const tensaoB = formatVoltage(phaseConsumption.TensaoB);
  const tensaoC = formatVoltage(phaseConsumption.TensaoC);

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Tensao A"
        data={{
          value: tensaoA.value,
          indicatorValue: tensaoA.indicatorValue,
          indicatorIsDecreasing: tensaoA.indicatorIsDecreasing,
          indicatorStyle: tensaoA.indicatorStyle,
          growthRate: 0,
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Tensao B"
        data={{
          value: tensaoB.value,
          indicatorValue: tensaoB.indicatorValue,
          indicatorIsDecreasing: tensaoB.indicatorIsDecreasing,
          indicatorStyle: tensaoB.indicatorStyle,
          growthRate: 0,
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Tensao C"
        data={{
          value: tensaoC.value,
          indicatorValue: tensaoC.indicatorValue,
          indicatorIsDecreasing: tensaoC.indicatorIsDecreasing,
          indicatorStyle: tensaoC.indicatorStyle,
          growthRate: 0,
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Consumo"
        data={{
          value: phaseConsumption.Potenciadireta,
          growthRate: 0,
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
