"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";
import { PhaseCardsClient } from "./phase-cards-client";

type PhaseType = "A" | "B" | "C";

type PropsType = {
  phase: PhaseType;
  phases?: PhaseType[];
  compact?: boolean;
};

const PHASE_FIELDS = {
  A: { corrente: "Ia", tensao: "Va", potencia: "Pa", fatorPotencia: "fpa" },
  B: { corrente: "Ib", tensao: "Vb", potencia: "Pb", fatorPotencia: "fpb" },
  C: { corrente: "Ic", tensao: "Vc", potencia: "Pc", fatorPotencia: "fpc" },
} as const;

type PhaseMetricKey = keyof (typeof PHASE_FIELDS)["A"];

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

const average = (values: number[]) =>
  values.reduce((total, value) => total + value, 0) / values.length;

const formatValue = (value: number | null, unit?: string) => {
  if (value === null) {
    return unit ? `-- ${unit}` : "--";
  }

  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return unit ? `${formatted} ${unit}` : formatted;
};

export function PhaseCards({ phase, phases, compact }: PropsType) {
  const { data } = useFirebaseData();
  const dataRecord = data as Record<string, unknown> | null;
  const phasesToUse = phases && phases.length > 0 ? phases : [phase];

  const readMetric = (metric: PhaseMetricKey) => {
    if (!dataRecord) {
      return null;
    }

    const values = phasesToUse
      .map((phaseKey) => toNumber(dataRecord[PHASE_FIELDS[phaseKey][metric]]))
      .filter((value): value is number => value !== null);

    return values.length > 0 ? average(values) : null;
  };

  const corrente = readMetric("corrente");
  const tensao = readMetric("tensao");
  const potencia = readMetric("potencia");
  const fatorPotencia = readMetric("fatorPotencia");

  const cards = [
    {
      label: "Corrente",
      value: formatValue(corrente, "A"),
      hideIndicator: true,
      iconName: "Current" as const,
    },
    {
      label: "Tensão",
      value: formatValue(tensao, "V"),
      hideIndicator: true,
      iconName: "Voltage" as const,
    },
    {
      label: "Potência",
      value: formatValue(potencia, "W"),
      hideIndicator: true,
      iconName: "Power" as const,
    },
    {
      label: "Fator de Potência",
      value: formatValue(fatorPotencia),
      hideIndicator: true,
      iconName: "PowerFactor" as const,
    },
  ];

  return <PhaseCardsClient cards={cards} compact={compact} />;
}
