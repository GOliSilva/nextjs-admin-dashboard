"use client";

import { PeriodPicker } from "@/components/period-picker";
import { getDataForGraph } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { InfoGeraisPeriod } from "@/services/info-gerais.services";
import { InfoGeraisLineChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  sectionKey?: string;
  title?: string;
  compact?: boolean;
};

type SeriesItem = {
  name: string;
  data: { x: unknown; y: number }[];
};

const normalizePeriod = (value?: string): InfoGeraisPeriod => {
  return value === "diario" || value === "diário" ? "diario" : "semanal";
};

const SERIES_CONFIG = [
  { name: "Potência ativa", field: "Pdir" },
  { name: "Potência reativa", field: "Q" },
  { name: "Potência complexa", field: "S" },
] as const;

const getRangeForPeriod = (period: InfoGeraisPeriod) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (period === "semanal" ? 7 : 1));
  return { start, end };
};

export function InfoGeraisPotenciaChart({
  timeFrame,
  className,
  sectionKey = "info_gerais_period",
  title = "Potências",
  compact,
}: PropsType) {
  const period = normalizePeriod(timeFrame);
  const [series, setSeries] = useState<SeriesItem[]>(() =>
    SERIES_CONFIG.map((item) => ({ name: item.name, data: [] })),
  );

  useEffect(() => {
    const { start, end } = getRangeForPeriod(period);
    setSeries(SERIES_CONFIG.map((item) => ({ name: item.name, data: [] })));

    const unsubscribes = SERIES_CONFIG.map((item, index) =>
      getDataForGraph(item.field, start, end, 500, (points: { x: unknown; y: number }[]) => {
        setSeries((prev) => {
          const next = [...prev];
          next[index] = { name: item.name, data: points };
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
  }, [period]);

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
          {title}
        </h2>

        <div className={compact ? "w-full sm:w-auto" : undefined}>
          <PeriodPicker
            defaultValue={period}
            sectionKey={sectionKey}
            items={[
              { value: "semanal", label: "semanal" },
              { value: "diario", label: "diário" },
            ]}
          />
        </div>
      </div>

      <InfoGeraisLineChart series={series} />
    </div>
  );
}
