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
};

const normalizePeriod = (value?: string): InfoGeraisPeriod => {
  return value === "diario" ? "diario" : "semanal";
};

export async function InfoGeraisPotenciaChart({
  timeFrame,
  className,
  sectionKey = "info_gerais_period",
  title = "Pot\u00EAncias",
}: PropsType) {
  const period = normalizePeriod(timeFrame);
  const series = await getInfoGeraisPotenciaSeries(period);

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          {title}
        </h2>

        <PeriodPicker
          defaultValue={period}
          sectionKey={sectionKey}
          items={["semanal", "diario"]}
        />
      </div>

      <InfoGeraisLineChart series={series} />
    </div>
  );
}
