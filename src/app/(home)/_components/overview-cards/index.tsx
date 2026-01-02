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
  const containerClassName = compact
    ? "flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5"
    : "grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5";
  const cardClassName = compact
    ? "min-w-[160px] shrink-0 sm:min-w-0"
    : undefined;
  const iconProps = compact
    ? { className: "size-10 sm:size-[58px]" }
    : undefined;

  return (
    <div className={containerClassName}>
      <OverviewCard
        label="Tensão A"
        data={{
          value: tensaoA.value,
          indicatorValue: tensaoA.indicatorValue,
          indicatorIsDecreasing: tensaoA.indicatorIsDecreasing,
          indicatorStyle: tensaoA.indicatorStyle,
          growthRate: 0,
        }}
        Icon={icons.VoltageA}
        className={cardClassName}
        iconProps={iconProps}
        compact={compact}
      />

      <OverviewCard
        label="Tensão B"
        data={{
          value: tensaoB.value,
          indicatorValue: tensaoB.indicatorValue,
          indicatorIsDecreasing: tensaoB.indicatorIsDecreasing,
          indicatorStyle: tensaoB.indicatorStyle,
          growthRate: 0,
        }}
        Icon={icons.VoltageB}
        className={cardClassName}
        iconProps={iconProps}
        compact={compact}
      />

      <OverviewCard
        label="Tensão C"
        data={{
          value: tensaoC.value,
          indicatorValue: tensaoC.indicatorValue,
          indicatorIsDecreasing: tensaoC.indicatorIsDecreasing,
          indicatorStyle: tensaoC.indicatorStyle,
          growthRate: 0,
        }}
        Icon={icons.VoltageC}
        className={cardClassName}
        iconProps={iconProps}
        compact={compact}
      />

      <OverviewCard
        label="Potência"
        data={{
          value: `${phaseConsumption.Potenciadireta} W`,
          growthRate: 0,
          hideIndicator: true,
        }}
        Icon={icons.Power}
        className={cardClassName}
        iconProps={iconProps}
        compact={compact}
      />
    </div>
  );
}
