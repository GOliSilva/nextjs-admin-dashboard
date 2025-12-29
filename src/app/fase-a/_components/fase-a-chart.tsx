import { PeriodPicker } from "@/components/period-picker";
import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";
import { getChartSeries, FaseAMetrics, TimeFrame } from "@/services/fase-a.services";
import { cn } from "@/lib/utils";

type PropsType = {
    metric?: string;
    timeFrame?: string;
    className?: string;
};

// Maps for UI labels to internal keys
const METRIC_MAP: Record<string, FaseAMetrics> = {
    "Corrente": "corrente",
    "Tensão": "tensao",
    "Potência": "potencia",
    "Fator de Potência": "fator_potencia"
};

const REVERSE_METRIC_MAP: Record<string, string> = Object.entries(METRIC_MAP).reduce((acc, [label, key]) => {
    acc[key] = label;
    return acc;
}, {} as Record<string, string>);

const TIME_FRAME_MAP: Record<string, TimeFrame> = {
    "diário": "day",
    "semanal": "week"
};

const REVERSE_TIME_FRAME_MAP: Record<string, string> = {
    "day": "diário",
    "week": "semanal"
};

export async function FaseAChart({
    metric,
    timeFrame,
    className,
}: PropsType) {
    // Defaults
    const resolvedMetricLabel = metric || "Corrente";
    const resolvedTimeFrameLabel = timeFrame || "diário";

    const metricKey = METRIC_MAP[resolvedMetricLabel] || "corrente";
    const timeFrameKey = TIME_FRAME_MAP[resolvedTimeFrameLabel] || "day";

    const seriesData = getChartSeries(metricKey, timeFrameKey);

    const series = [{
        name: resolvedMetricLabel,
        data: seriesData
    }];

    return (
        <div
            className={cn(
                "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                    {resolvedMetricLabel} ({resolvedTimeFrameLabel})
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                    <PeriodPicker
                        defaultValue={resolvedMetricLabel}
                        sectionKey={"metric"}
                        items={Object.keys(METRIC_MAP)}
                    />

                    <PeriodPicker
                        defaultValue={resolvedTimeFrameLabel}
                        sectionKey={"time_frame"}
                        items={Object.keys(TIME_FRAME_MAP)}
                    />
                </div>
            </div>

            <PaymentsOverviewChart series={series} colors={["#5750F1"]} />
        </div>
    );
}
