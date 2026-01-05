"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";
import { PhaseInfoClient } from "./phase-info-client";

type PhaseType = "A" | "B" | "C";

type PropsType = {
  phase: PhaseType;
  compact?: boolean;
};

const PHASE_ANGLE_FIELDS = {
  A: { corrente: "angIa", tensao: "angVa" },
  B: { corrente: "angIb", tensao: "angVb" },
  C: { corrente: "angIc", tensao: "angVc" },
} as const;

type PhaseAngleKey = keyof (typeof PHASE_ANGLE_FIELDS)["A"];

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

const formatAngle = (value: number | null) => {
  if (value === null) {
    return "--";
  }

  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return `${formatted}°`;
};

const normalizeDegrees = (value: number) => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const calcPhaseShift = (voltage: number | null, current: number | null) => {
  if (voltage === null || current === null) {
    return null;
  }

  let diff = normalizeDegrees(voltage) - normalizeDegrees(current);
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }

  return diff;
};

const readAngle = (data: Record<string, unknown> | null, phase: PhaseType, key: PhaseAngleKey) => {
  if (!data) {
    return null;
  }

  return toNumber(data[PHASE_ANGLE_FIELDS[phase][key]]);
};

export function PhaseInfo({ phase, compact }: PropsType) {
  const { data } = useFirebaseData();
  const dataRecord = data as Record<string, unknown> | null;

  const corrente = readAngle(dataRecord, phase, "corrente");
  const tensao = readAngle(dataRecord, phase, "tensao");
  const defasagem = calcPhaseShift(tensao, corrente);

  const cards = [
    {
      label: "Ângulo de Corrente",
      value: formatAngle(corrente),
      hideIndicator: true,
      iconName: "AngleCurrent" as const,
    },
    {
      label: "Ângulo de Tensão",
      value: formatAngle(tensao),
      hideIndicator: true,
      iconName: "AngleVoltage" as const,
    },
    {
      label: "Defasagem",
      value: formatAngle(defasagem),
      hideIndicator: true,
      iconName: "PhaseShift" as const,
    },
  ];

  return (
    <PhaseInfoClient
      cards={cards}
      compact={compact}
      className="sm:grid-cols-3 xl:grid-cols-3"
    />
  );
}
