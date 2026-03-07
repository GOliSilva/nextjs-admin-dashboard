"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";
import { standardFormat } from "@/lib/format-number";
import { OverviewCardsClient } from "./cards-client";

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

const formatMetric = (rawValue: unknown, unit: string) => {
  const numeric = toNumber(rawValue);
  if (numeric === null) {
    return "--";
  }
  return `${standardFormat(numeric)} ${unit}`;
};

const buildPhaseRows = (values: [unknown, unknown, unknown], unit: string) => [
  { label: "A", value: formatMetric(values[0], unit) },
  { label: "B", value: formatMetric(values[1], unit) },
  { label: "C", value: formatMetric(values[2], unit) },
];

type OverviewCardsGroupProps = {
  compact?: boolean;
};

export function OverviewCardsGroup({ compact }: OverviewCardsGroupProps) {
  const { data, isLoading } = useFirebaseData();

  if (isLoading || !data) {
    return (
      <OverviewCardsClient
        compact={compact}
        cards={[
          {
            label: "Energia total do mês",
            value: "-- kWh",
            hideIndicator: true,
            iconName: "PowerComplex" as const,
          },
          {
            label: "Tensões",
            value: "--",
            rows: [
              { label: "A", value: "--" },
              { label: "B", value: "--" },
              { label: "C", value: "--" },
            ],
            hideIndicator: true,
            iconName: "Voltage" as const,
          },
          {
            label: "Correntes",
            value: "--",
            rows: [
              { label: "A", value: "--" },
              { label: "B", value: "--" },
              { label: "C", value: "--" },
            ],
            hideIndicator: true,
            iconName: "Current" as const,
          },
          {
            label: "Potências",
            value: "--",
            rows: [
              { label: "A", value: "--" },
              { label: "B", value: "--" },
              { label: "C", value: "--" },
            ],
            hideIndicator: true,
            iconName: "Power" as const,
          },
        ]}
      />
    );
  }

  const energyValues = [toNumber(data.Ea), toNumber(data.Eb), toNumber(data.Ec)].filter(
    (value): value is number => value !== null,
  );
  const totalEnergy =
    energyValues.length === 0
      ? "-- kWh"
      : `${standardFormat(energyValues.reduce((sum, value) => sum + value, 0))} kWh`;

  const cardsData = [
    {
      label: "Energia total do mês",
      value: totalEnergy,
      hideIndicator: true,
      iconName: "PowerComplex" as const,
    },
    {
      label: "Tensões",
      value: "--",
      rows: buildPhaseRows([data.Va, data.Vb, data.Vc], "V"),
      hideIndicator: true,
      iconName: "Voltage" as const,
    },
    {
      label: "Correntes",
      value: "--",
      rows: buildPhaseRows([data.Ia, data.Ib, data.Ic], "A"),
      hideIndicator: true,
      iconName: "Current" as const,
    },
    {
      label: "Potências",
      value: "--",
      rows: buildPhaseRows([data.Pa, data.Pb, data.Pc], "W"),
      hideIndicator: true,
      iconName: "Power" as const,
    },
  ];

  return <OverviewCardsClient cards={cardsData} compact={compact} />;
}
