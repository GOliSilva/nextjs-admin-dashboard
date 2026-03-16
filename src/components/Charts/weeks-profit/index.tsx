"use client";

import { useEffect, useState } from "react";
import { PeriodPicker } from "@/components/period-picker";
import { useDeviceSelection } from "@/contexts/device-selection-context";
import { getMonthlyData } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { WeeksProfitChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  compact?: boolean;
};

type MonthlyDoc = {
  id: string;
  monthKey?: string;
  consumoTotalPonta?: unknown;
  consumoTotalForaPonta?: unknown;
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

function buildMonthlyComparison(docs: MonthlyDoc[], mode: "ponta" | "fora ponta") {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const thisYear = MONTH_LABELS.map((month) => ({ x: month, y: 0 }));
  const lastYear = MONTH_LABELS.map((month) => ({ x: month, y: 0 }));
  const valueKey = mode === "fora ponta" ? "consumoTotalForaPonta" : "consumoTotalPonta";

  docs.forEach((doc) => {
    const parsed = parseMonthKey(doc.monthKey ?? doc.id);
    if (!parsed) {
      return;
    }

    const value = toNumber(doc[valueKey]);
    if (parsed.year === currentYear) {
      thisYear[parsed.monthIndex] = { x: MONTH_LABELS[parsed.monthIndex], y: value };
      return;
    }

    if (parsed.year === previousYear) {
      lastYear[parsed.monthIndex] = { x: MONTH_LABELS[parsed.monthIndex], y: value };
    }
  });

  return { thisYear, lastYear };
}

export function WeeksProfit({
  className,
  timeFrame,
  compact,
}: PropsType) {
  const { selectedDeviceId } = useDeviceSelection();
  const resolvedMode = timeFrame === "fora ponta" ? "fora ponta" : "ponta";
  const [data, setData] = useState(() => buildMonthlyComparison([], resolvedMode));

  useEffect(() => {
    setData(buildMonthlyComparison([], resolvedMode));

    return getMonthlyData((docs: MonthlyDoc[]) => {
      setData(buildMonthlyComparison(docs, resolvedMode));
    }, selectedDeviceId);
  }, [resolvedMode, selectedDeviceId]);

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
          {resolvedMode === "fora ponta"
            ? "Consumo fora ponta"
            : "Consumo ponta"}
        </h2>

        <div className={compact ? "w-full sm:w-auto" : undefined}>
          <PeriodPicker
            items={["ponta", "fora ponta"]}
            defaultValue={resolvedMode}
            sectionKey="weeks_profit"
          />
        </div>
      </div>

      <WeeksProfitChart data={data} />
    </div>
  );
}
