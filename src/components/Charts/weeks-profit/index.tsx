import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getConsumoPontaSeries } from "@/services/consumo-ponta.services";
import { WeeksProfitChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  compact?: boolean;
};

export async function WeeksProfit({
  className,
  timeFrame,
  compact,
}: PropsType) {
  const resolvedMode = timeFrame === "fora ponta" ? "fora ponta" : "ponta";
  const data = await getConsumoPontaSeries(resolvedMode);
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
