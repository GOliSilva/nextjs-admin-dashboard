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
  compact?: boolean;
};

export async function ConsumoPorFaseLine({
  timeFrame = "semanal",
  className,
  title = "Consumos por fase",
  sectionKey = "consumos_por_fase",
  compact,
}: PropsType) {
  const period = timeFrame === "diario" ? "diario" : "semanal";
  const series = await getConsumoPorFaseLinha(period);

  const summaryItems = series.map((item) => ({
    label: item.name,
    value: `${standardFormat(item.data.reduce((acc, point) => acc + point.y, 0))} kWh`,
  }));
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
  const summaryValueClassName = cn(
    "font-bold text-dark dark:text-white",
    compact ? "text-lg sm:text-xl" : "text-xl",
  );
  const summaryLabelClassName = cn(
    "font-medium dark:text-dark-6",
    compact ? "text-xs sm:text-sm" : undefined,
  );

  return (
    <div className={containerClassName}>
      <div className={headerClassName}>
        <h2 className={titleClassName}>{title}</h2>

        <div className={compact ? "w-full sm:w-auto" : undefined}>
          <PeriodPicker
            defaultValue={period}
            sectionKey={sectionKey}
            items={["semanal", "diario"]}
          />
        </div>
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
            <dt className={summaryValueClassName}>{item.value}</dt>
            <dd className={summaryLabelClassName}>{item.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
