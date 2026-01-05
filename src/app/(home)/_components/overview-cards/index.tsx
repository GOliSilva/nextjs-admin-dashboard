"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";
import { standardFormat } from "@/lib/format-number";
import { OverviewCardsClient } from "./cards-client";

const BASE_VOLTAGE = 220;
const MAX_DEVIATION_RATIO = 0.1;

const toNumber = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

const getVoltageColor = (value: number) => {
  const ratio = Math.abs(value - BASE_VOLTAGE) / BASE_VOLTAGE;
  const clamped = Math.min(ratio, MAX_DEVIATION_RATIO);
  const hue = 120 - (clamped / MAX_DEVIATION_RATIO) * 120;

  return `hsl(${hue} 80% 40%)`;
};

const formatVoltage = (rawValue: unknown) => {
  const numeric = toNumber(rawValue);

  if (numeric === null) {
    return {
      value: "--",
      indicatorValue: "--",
      indicatorIsDecreasing: false,
      indicatorStyle: undefined,
      hideIndicator: true,
    };
  }

  const percent = (numeric / BASE_VOLTAGE) * 100;

  return {
    value: `${numeric.toFixed(2)} V`,
    indicatorValue: `${percent.toFixed(1)}%`,
    indicatorIsDecreasing: numeric < BASE_VOLTAGE,
    indicatorStyle: { color: getVoltageColor(numeric) },
    hideIndicator: false,
  };
};

type OverviewCardsGroupProps = {
  compact?: boolean;
};

const getPowerValue = (data: Record<string, unknown> | null) => {
  const directPower = toNumber(data?.Pdir);
  if (directPower !== null) {
    return directPower;
  }

  const phasePowers = [toNumber(data?.Pa), toNumber(data?.Pb), toNumber(data?.Pc)]
    .filter((value) => value !== null) as number[];

  if (phasePowers.length > 0) {
    return phasePowers.reduce((total, value) => total + value, 0);
  }

  return null;
};

export function OverviewCardsGroup({ compact }: OverviewCardsGroupProps) {
  const { data, isLoading } = useFirebaseData();

  if (isLoading || !data) {
    return (
      <OverviewCardsClient
        compact={compact}
        cards={[
          {
            label: "TensAśo A",
            value: "--",
            hideIndicator: true,
            iconName: "VoltageA" as const,
          },
          {
            label: "TensAśo B",
            value: "--",
            hideIndicator: true,
            iconName: "VoltageB" as const,
          },
          {
            label: "TensAśo C",
            value: "--",
            hideIndicator: true,
            iconName: "VoltageC" as const,
          },
          {
            label: "PotA¦ncia",
            value: "-- W",
            hideIndicator: true,
            iconName: "Power" as const,
          },
        ]}
      />
    );
  }

  const tensaoA = formatVoltage(data.Va);
  const tensaoB = formatVoltage(data.Vb);
  const tensaoC = formatVoltage(data.Vc);
  const powerValue = getPowerValue(data as Record<string, unknown>);
  const powerLabel =
    powerValue === null ? "-- W" : `${standardFormat(powerValue)} W`;

  const cardsData = [
    {
      label: "TensAśo A",
      value: tensaoA.value,
      indicatorValue: tensaoA.indicatorValue,
      indicatorIsDecreasing: tensaoA.indicatorIsDecreasing,
      indicatorStyle: tensaoA.indicatorStyle,
      hideIndicator: tensaoA.hideIndicator,
      iconName: "VoltageA" as const,
    },
    {
      label: "TensAśo B",
      value: tensaoB.value,
      indicatorValue: tensaoB.indicatorValue,
      indicatorIsDecreasing: tensaoB.indicatorIsDecreasing,
      indicatorStyle: tensaoB.indicatorStyle,
      hideIndicator: tensaoB.hideIndicator,
      iconName: "VoltageB" as const,
    },
    {
      label: "TensAśo C",
      value: tensaoC.value,
      indicatorValue: tensaoC.indicatorValue,
      indicatorIsDecreasing: tensaoC.indicatorIsDecreasing,
      indicatorStyle: tensaoC.indicatorStyle,
      hideIndicator: tensaoC.hideIndicator,
      iconName: "VoltageC" as const,
    },
    {
      label: "PotA¦ncia",
      value: powerLabel,
      hideIndicator: true,
      iconName: "Power" as const,
    },
  ];

  return <OverviewCardsClient cards={cardsData} compact={compact} />;
}
