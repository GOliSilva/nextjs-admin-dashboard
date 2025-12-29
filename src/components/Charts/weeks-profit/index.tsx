import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getConsumoPontaSeries } from "@/services/consumo-ponta.services";
import { WeeksProfitChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function WeeksProfit({ className, timeFrame }: PropsType) {
  const resolvedMode = timeFrame === "fora ponta" ? "fora ponta" : "ponta";
  const data = await getConsumoPontaSeries(resolvedMode);

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          {resolvedMode === "fora ponta"
            ? "Consumo fora ponta"
            : "Consumo ponta"}
        </h2>

        <PeriodPicker
          items={["ponta", "fora ponta"]}
          defaultValue={resolvedMode}
          sectionKey="weeks_profit"
        />
      </div>

      <WeeksProfitChart data={data} />
    </div>
  );
}
