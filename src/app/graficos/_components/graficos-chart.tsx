"use client";

import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";
import { PeriodPicker } from "@/components/period-picker";
import { getDataForGraph } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { PhaseMetrics, TimeFrame } from "@/services/phase-data.services";

type Props = {
  title: string;
  metric: PhaseMetrics;
  timeFrame?: string;
  sectionKey: string;
  className?: string;
  compact?: boolean;
};

type SeriesItem = {
  name: string;
  data: { x: unknown; y: number }[];
};

const TIMEFRAME_MAP: Record<string, TimeFrame> = {
  diario: "day",
  semanal: "week",
};

const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  day: "diario",
  week: "semanal",
};

const PHASES = ["A", "B", "C"] as const;

type PhaseKey = (typeof PHASES)[number];

type MetricMap = Partial<Record<PhaseMetrics, Record<PhaseKey, string>>>;

const METRIC_FIELDS: MetricMap = {
  corrente: { A: "Ia", B: "Ib", C: "Ic" },
  tensao: { A: "Va", B: "Vb", C: "Vc" },
  potencia: { A: "Pa", B: "Pb", C: "Pc" },
  fator_potencia: { A: "fpa", B: "fpb", C: "fpc" },
};

const getRangeForTimeFrame = (timeFrame: TimeFrame) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (timeFrame === "week" ? 7 : 1));
  return { start, end };
};

export function GraficosChart({
  title,
  metric,
  timeFrame,
  sectionKey,
  className,
  compact,
}: Props) {
  const resolvedTimeFrame =
    timeFrame && TIMEFRAME_MAP[timeFrame] ? TIMEFRAME_MAP[timeFrame] : "day";
  const [series, setSeries] = useState<SeriesItem[]>(() =>
    PHASES.map((phase) => ({ name: `Fase ${phase}`, data: [] })),
  );

  useEffect(() => {
    const variableMap = METRIC_FIELDS[metric];
    if (!variableMap) {
      setSeries(PHASES.map((phase) => ({ name: `Fase ${phase}`, data: [] })));
      return undefined;
    }

    const { start, end } = getRangeForTimeFrame(resolvedTimeFrame);
    setSeries(PHASES.map((phase) => ({ name: `Fase ${phase}`, data: [] })));

    const unsubscribes = PHASES.map((phase, index) =>
      getDataForGraph(variableMap[phase], start, end, 500, (points: { x: unknown; y: number }[]) => {
        setSeries((prev) => {
          const next = [...prev];
          next[index] = { name: `Fase ${phase}`, data: points };
          return next;
        });
      }),
    );

    return () => {
      unsubscribes.forEach((unsub) => {
        if (typeof unsub === "function") {
          unsub();
        }
      });
    };
  }, [metric, resolvedTimeFrame]);

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card",
        compact ? "p-4 sm:px-7.5 sm:pb-6 sm:pt-7.5" : "px-7.5 pb-6 pt-7.5",
        className,
      )}
    >
      <div
        className={
          compact
            ? "flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
            : "flex flex-wrap items-center justify-between gap-4"
        }
      >
        <h2
          className={cn(
            "font-bold text-dark dark:text-white",
            compact ? "text-lg sm:text-body-2xlg" : "text-body-2xlg",
          )}
        >
          {title} ({TIMEFRAME_LABELS[resolvedTimeFrame]})
        </h2>
        <div className={compact ? "w-full sm:w-auto" : undefined}>
          <PeriodPicker
            defaultValue={TIMEFRAME_LABELS[resolvedTimeFrame]}
            sectionKey={sectionKey}
            items={["diario", "semanal"]}
          />
        </div>
      </div>

      <PaymentsOverviewChart
        series={series}
        colors={["#5750F1", "#0ABEF9", "#F2994A"]}
      />
    </div>
  );
}
