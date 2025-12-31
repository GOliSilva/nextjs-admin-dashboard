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
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          {title} ({TIMEFRAME_LABELS[resolvedTimeFrame]})
        </h2>
        <PeriodPicker
          defaultValue={TIMEFRAME_LABELS[resolvedTimeFrame]}
          sectionKey={sectionKey}
          items={["diario", "semanal"]}
        />
      </div>

      <PaymentsOverviewChart series={series} colors={["#5750F1", "#0ABEF9", "#F2994A"]} />
    </div>
  );
}
