import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import {
  getInfoGeraisPotenciaSeries,
  type InfoGeraisPeriod,
} from "@/services/info-gerais.services";
import { InfoGeraisLineChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  sectionKey?: string;
  title?: string;
  compact?: boolean;
};

const normalizePeriod = (value?: string): InfoGeraisPeriod => {
  return value === "diario" ? "diario" : "semanal";
};

export async function InfoGeraisPotenciaChart({
  timeFrame,
  className,
  sectionKey = "info_gerais_period",
  title = "Pot\u00EAncias",
  compact,
}: PropsType) {
  const period = normalizePeriod(timeFrame);
  const series = await getInfoGeraisPotenciaSeries(period);

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
            items={["semanal", "diario"]}
          />
        </div>
      </div>

      <InfoGeraisLineChart series={series} />
    </div>
  );
}
