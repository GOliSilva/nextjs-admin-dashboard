import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getConsumoPorFaseLinha } from "@/services/consumo-por-fase-linha.services";
import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  title?: string;
  sectionKey?: string;
};

export async function ConsumoPorFaseLine({
  timeFrame = "semanal",
  className,
  title = "Consumos por fase",
  sectionKey = "consumos_por_fase",
}: PropsType) {
  const period = timeFrame === "diario" ? "diario" : "semanal";
  const series = await getConsumoPorFaseLinha(period);

  const summaryItems = series.map((item) => ({
    label: item.name,
    value: `${standardFormat(item.data.reduce((acc, point) => acc + point.y, 0))} kWh`,
  }));

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

      <PaymentsOverviewChart
        series={series}
        colors={["#0ABEF9", "#22C55E", "#F59E0B"]}
      />

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-3 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              index === 0 && "dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3",
              index === 1 && "max-sm:mb-3 max-sm:border-b max-sm:pb-3",
            )}
          >
            <dt className="text-xl font-bold text-dark dark:text-white">
              {item.value}
            </dt>
            <dd className="font-medium dark:text-dark-6">{item.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
