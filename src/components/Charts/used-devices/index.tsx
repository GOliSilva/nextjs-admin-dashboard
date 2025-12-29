import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getConsumoPorFase } from "@/services/consumo-por-fase.services";
import { DonutChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function UsedDevices({
  timeFrame = "semanal",
  className,
}: PropsType) {
  const period = timeFrame === "mensal" ? "mensal" : "semanal";
  const data = await getConsumoPorFase(period);

  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Consumo por Fase
        </h2>

        <PeriodPicker
          defaultValue={period}
          sectionKey="used_devices"
          items={["semanal", "mensal"]}
        />
      </div>

      <div className="grid place-items-center">
        <DonutChart data={data} />
      </div>
    </div>
  );
}
