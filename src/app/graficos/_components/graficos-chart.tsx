import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";
import { PeriodPicker } from "@/components/period-picker";
import { getChartSeries, type PhaseMetrics, type TimeFrame } from "@/services/phase-data.services";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  metric: PhaseMetrics;
  timeFrame?: string;
  sectionKey: string;
  className?: string;
  compact?: boolean;
};

const TIMEFRAME_MAP: Record<string, TimeFrame> = {
  diario: "day",
  semanal: "week",
};

const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  day: "diario",
  week: "semanal",
};

export function GraficosChart({
  title,
  metric,
  timeFrame,
  sectionKey,
  className,
  compact,
}: Props) {
  const resolvedTimeFrame =
    timeFrame && TIMEFRAME_MAP[timeFrame] ? TIMEFRAME_MAP[timeFrame] : "day";
  const phases = ["A", "B", "C"] as const;
  const series = phases.map((phase) => ({
    name: `Fase ${phase}`,
    data: getChartSeries(phase, metric, resolvedTimeFrame),
  }));

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
          {title} ({TIMEFRAME_LABELS[resolvedTimeFrame]})
        </h2>
        <div className={compact ? "w-full sm:w-auto" : undefined}>
          <PeriodPicker
            defaultValue={TIMEFRAME_LABELS[resolvedTimeFrame]}
            sectionKey={sectionKey}
            items={["diario", "semanal"]}
          />
        </div>
      </div>

      <PaymentsOverviewChart series={series} colors={["#5750F1", "#0ABEF9", "#F2994A"]} />
    </div>
  );
}
