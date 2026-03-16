"use client";

import { useEffect, useMemo, useState } from "react";
import { PeriodPicker } from "@/components/period-picker";
import { EnergyChart } from "@/app/fase-a/_components/energy-chart";
import { useDeviceSelection } from "@/contexts/device-selection-context";
import { getMonthlyData } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type PhaseType = "A" | "B" | "C";

type PropsType = {
  phase: PhaseType;
  phases?: PhaseType[];
  energyType?: string;
  className?: string;
  compact?: boolean;
};

type MonthlyDoc = {
  id: string;
  monthKey?: string;
  monthlyPonta?: Record<string, unknown>;
  monthlyForaPonta?: Record<string, unknown>;
};

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const PHASE_ENERGY_FIELDS: Record<PhaseType, string> = {
  A: "Ea",
  B: "Eb",
  C: "Ec",
};

function parseMonthKey(value?: string | null) {
  const match = typeof value === "string" ? /^(\d{4})-(\d{2})$/.exec(value) : null;
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const monthIndex = Number.parseInt(match[2], 10) - 1;
  if (!Number.isInteger(year) || monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  return { year, monthIndex };
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function buildEnergySeries(
  docs: MonthlyDoc[],
  phases: PhaseType[],
  energyType: "ponta" | "nao_ponta",
) {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const anoAtual = MONTH_LABELS.map(() => 0);
  const anoAnterior = MONTH_LABELS.map(() => 0);
  const valueKey = energyType === "ponta" ? "monthlyPonta" : "monthlyForaPonta";

  docs.forEach((doc) => {
    const parsed = parseMonthKey(doc.monthKey ?? doc.id);
    if (!parsed) {
      return;
    }

    const source = doc[valueKey];
    const total = phases.reduce((sum, phaseKey) => {
      const field = PHASE_ENERGY_FIELDS[phaseKey];
      const value = source && typeof source === "object" ? toNumber(source[field]) : 0;
      return sum + value;
    }, 0);

    if (parsed.year === currentYear) {
      anoAtual[parsed.monthIndex] = total;
      return;
    }

    if (parsed.year === previousYear) {
      anoAnterior[parsed.monthIndex] = total;
    }
  });

  return {
    categories: MONTH_LABELS,
    anoAtual,
    anoAnterior,
  };
}

export function PhaseEnergyChart({ phase, phases, energyType, className, compact }: PropsType) {
  const { selectedDeviceId } = useDeviceSelection();
  const resolvedType = (energyType === "nao_ponta" ? "nao_ponta" : "ponta") as
    | "ponta"
    | "nao_ponta";
  const phasesToUse = useMemo(
    () => (phases && phases.length > 0 ? phases : [phase]),
    [phase, phases],
  );
  const [chartData, setChartData] = useState(() =>
    buildEnergySeries([], phasesToUse, resolvedType),
  );

  useEffect(() => {
    setChartData(buildEnergySeries([], phasesToUse, resolvedType));

    return getMonthlyData((docs: MonthlyDoc[]) => {
      setChartData(buildEnergySeries(docs, phasesToUse, resolvedType));
    }, selectedDeviceId);
  }, [phasesToUse, resolvedType, selectedDeviceId]);

  const containerClassName = cn(
    "rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card",
    compact ? "p-4 sm:px-7.5 sm:pb-6 sm:pt-7.5" : "px-7.5 pt-7.5",
    className,
  );
  const headerClassName = compact
    ? "flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
    : "flex flex-wrap items-center justify-between gap-4";
  const titleClassName = cn(
    "font-bold text-dark dark:text-white",
    compact ? "text-lg sm:text-body-2xlg" : "text-body-2xlg",
  );

  return (
    <div className={containerClassName}>
      <div className={headerClassName}>
        <h2 className={titleClassName}>
          Consumo de Energia ({resolvedType === "ponta" ? "Ponta" : "Nao Ponta"})
        </h2>

        <div className={compact ? "w-full sm:w-auto" : undefined}>
          <PeriodPicker
            items={["ponta", "nao_ponta"]}
            defaultValue={resolvedType}
            sectionKey="energy_type"
          />
        </div>
      </div>

      <EnergyChart
        categories={chartData.categories}
        anoAtual={chartData.anoAtual}
        anoAnterior={chartData.anoAnterior}
      />
    </div>
  );
}
