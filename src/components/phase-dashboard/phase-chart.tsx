"use client";

import { PeriodPicker } from "@/components/period-picker";
import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";
import { getDataForGraph } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { PhaseMetrics, TimeFrame, PhaseType } from "@/services/phase-data.services";

type PropsType = {
  phase: PhaseType;
  phases?: PhaseType[];
  metric?: string;
  timeFrame?: string;
  className?: string;
  compact?: boolean;
};

type SeriesItem = {
  name: string;
  data: { x: unknown; y: number }[];
};

const METRIC_MAP: Record<string, PhaseMetrics> = {
  Corrente: "corrente",
  "Tensão": "tensao",
  Tensao: "tensao",
  "Potência": "potencia",
  Potencia: "potencia",
  "Fator de Potência": "fator_potencia",
  "Fator de Potencia": "fator_potencia",
};

const METRIC_LABELS: Record<PhaseMetrics, string> = {
  corrente: "Corrente",
  tensao: "Tensão",
  potencia: "Potência",
  fator_potencia: "Fator de Potência",
  energia: "Energia",
  fase: "Fase",
};

const TIME_FRAME_MAP: Record<string, TimeFrame> = {
  diario: "day",
  "diário": "day",
  semanal: "week",
};

const TIME_FRAME_LABELS: Record<TimeFrame, string> = {
  day: "diário",
  week: "semanal",
};

const PHASE_FIELDS: Record<PhaseType, Record<PhaseMetrics, string>> = {
  A: {
    corrente: "Ia",
    tensao: "Va",
    potencia: "Pa",
    fator_potencia: "fpa",
    energia: "Ea",
    fase: "fase",
  },
  B: {
    corrente: "Ib",
    tensao: "Vb",
    potencia: "Pb",
    fator_potencia: "fpb",
    energia: "Eb",
    fase: "fase",
  },
  C: {
    corrente: "Ic",
    tensao: "Vc",
    potencia: "Pc",
    fator_potencia: "fpc",
    energia: "Ec",
    fase: "fase",
  },
};

const getRangeForTimeFrame = (timeFrame: TimeFrame) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (timeFrame === "week" ? 7 : 1));
  return { start, end };
};

export function PhaseChart({
  phase,
  phases,
  metric,
  timeFrame,
  className,
  compact,
}: PropsType) {
  const metricKey = METRIC_MAP[metric ?? ""] ?? "corrente";
  const resolvedMetricLabel = METRIC_LABELS[metricKey] ?? "Corrente";
  const timeFrameKey = TIME_FRAME_MAP[timeFrame ?? ""] ?? "day";
  const resolvedTimeFrameLabel = TIME_FRAME_LABELS[timeFrameKey];

  const phasesToRender = phases && phases.length > 0 ? phases : [phase];
  const [series, setSeries] = useState<SeriesItem[]>(() =>
    phasesToRender.map((phaseKey) => ({
      name:
        phasesToRender.length > 1
          ? `Fase ${phaseKey}`
          : resolvedMetricLabel,
      data: [],
    })),
  );

  useEffect(() => {
    setSeries(
      phasesToRender.map((phaseKey) => ({
        name:
          phasesToRender.length > 1
            ? `Fase ${phaseKey}`
            : resolvedMetricLabel,
        data: [],
      })),
    );
  }, [phasesToRender.join(","), resolvedMetricLabel]);

  useEffect(() => {
    const { start, end } = getRangeForTimeFrame(timeFrameKey);

    const unsubscribes = phasesToRender.map((phaseKey, index) =>
      getDataForGraph(
        PHASE_FIELDS[phaseKey][metricKey],
        start,
        end,
        500,
        (points: { x: unknown; y: number }[]) => {
          setSeries((prev) => {
            const next = [...prev];
            next[index] = {
              name:
                phasesToRender.length > 1
                  ? `Fase ${phaseKey}`
                  : resolvedMetricLabel,
              data: points,
            };
            return next;
          });
        },
      ),
    );

    return () => {
      unsubscribes.forEach((unsub) => {
        if (typeof unsub === "function") {
          unsub();
        }
      });
    };
  }, [metricKey, timeFrameKey, phasesToRender.join(","), resolvedMetricLabel]);

  const phaseColors: Record<PhaseType, string> = {
    A: "#5750F1",
    B: "#0ABEF9",
    C: "#F2994A",
  };

  const chartColors =
    phasesToRender.length > 1
      ? phasesToRender.map((phaseKey) => phaseColors[phaseKey])
      : ["#5750F1"];
  const containerClassName = cn(
    "grid gap-2 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card",
    compact ? "p-4 sm:px-7.5 sm:pb-6 sm:pt-7.5" : "px-7.5 pb-6 pt-7.5",
    className,
  );
  const headerClassName = compact
    ? "flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
    : "flex flex-wrap items-center justify-between gap-4";
  const titleClassName = cn(
    "font-bold text-dark dark:text-white",
    compact ? "text-lg sm:text-body-2xlg" : "text-body-2xlg",
  );
  const pickerGroupClassName = compact
    ? "flex w-full flex-wrap items-center gap-2 sm:w-auto"
    : "flex flex-wrap items-center gap-2";

  return (
    <div className={containerClassName}>
      <div className={headerClassName}>
        <h2 className={titleClassName}>
          {resolvedMetricLabel} ({resolvedTimeFrameLabel})
        </h2>

        <div className={pickerGroupClassName}>
          <div className={compact ? "w-full sm:w-auto" : undefined}>
            <PeriodPicker
              defaultValue={resolvedMetricLabel}
              sectionKey={"metric"}
              items={[
                { value: "Corrente", label: "Corrente" },
                { value: "Tensao", label: "Tensão" },
                { value: "Potencia", label: "Potência" },
                { value: "Fator de Potencia", label: "Fator de Potência" },
              ]}
            />
          </div>

          <div className={compact ? "w-full sm:w-auto" : undefined}>
            <PeriodPicker
              defaultValue={resolvedTimeFrameLabel}
              sectionKey={"time_frame"}
              items={[
                { value: "diario", label: "diário" },
                { value: "semanal", label: "semanal" },
              ]}
            />
          </div>
        </div>
      </div>

      <PaymentsOverviewChart series={series} colors={chartColors} />
    </div>
  );
}
