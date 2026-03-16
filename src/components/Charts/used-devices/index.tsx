"use client";

import { useEffect, useState } from "react";
import { PeriodPicker } from "@/components/period-picker";
import { useDeviceSelection } from "@/contexts/device-selection-context";
import {
  buildConsumoPorFaseBreakdown,
  type DailyEnergyDoc,
} from "@/lib/daily-energy";
import { getDailyEnergyData } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { DonutChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  compact?: boolean;
};

type PhaseBreakdownItem = {
  name: string;
  amount: number;
};

const EMPTY_BREAKDOWN: PhaseBreakdownItem[] = [
  { name: "Fase A", amount: 0 },
  { name: "Fase B", amount: 0 },
  { name: "Fase C", amount: 0 },
];

export function UsedDevices({
  timeFrame = "semanal",
  className,
  compact,
}: PropsType) {
  const { selectedDeviceId } = useDeviceSelection();
  const period = timeFrame === "mensal" ? "mensal" : "semanal";
  const [data, setData] = useState<PhaseBreakdownItem[]>(EMPTY_BREAKDOWN);

  useEffect(() => {
    setData(EMPTY_BREAKDOWN);

    return getDailyEnergyData((docs: DailyEnergyDoc[]) => {
      setData(buildConsumoPorFaseBreakdown(docs, period));
    }, selectedDeviceId);
  }, [period, selectedDeviceId]);

  const containerClassName = cn(
    "grid grid-cols-1 grid-rows-[auto_1fr] rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card",
    compact ? "gap-4 p-4 sm:gap-9 sm:p-7.5" : "gap-9 p-7.5",
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
        <h2 className={titleClassName}>Consumo por Fase</h2>

        <div className={compact ? "w-full sm:w-auto" : undefined}>
          <PeriodPicker
            defaultValue={period}
            sectionKey="used_devices"
            items={["semanal", "mensal"]}
          />
        </div>
      </div>

      <div className="grid place-items-center">
        <DonutChart data={data} />
      </div>
    </div>
  );
}
