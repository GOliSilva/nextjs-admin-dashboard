import { PeriodPicker } from "@/components/period-picker";
import { PaymentsOverviewChart } from "@/components/Charts/payments-overview/chart";
import { getChartSeries, PhaseMetrics, TimeFrame, PhaseType } from "@/services/phase-data.services";
import { cn } from "@/lib/utils";

type PropsType = {
    phase: PhaseType;
    phases?: PhaseType[];
    metric?: string;
    timeFrame?: string;
    className?: string;
    compact?: boolean;
};

// Maps for UI labels to internal keys
const METRIC_MAP: Record<string, PhaseMetrics> = {
    "Corrente": "corrente",
    "Tensão": "tensao",
    "Potência": "potencia",
    "Fator de Potência": "fator_potencia"
};

const TIME_FRAME_MAP: Record<string, TimeFrame> = {
    "diário": "day",
    "semanal": "week"
};

export async function PhaseChart({
    phase,
    phases,
    metric,
    timeFrame,
    className,
    compact,
}: PropsType) {
    // Defaults
    const resolvedMetricLabel = metric || "Corrente";
    const resolvedTimeFrameLabel = timeFrame || "diário";

    const metricKey = METRIC_MAP[resolvedMetricLabel] || "corrente";
    const timeFrameKey = TIME_FRAME_MAP[resolvedTimeFrameLabel] || "day";

    const phasesToRender = phases && phases.length > 0 ? phases : [phase];
    const series = phasesToRender.map((phaseKey) => ({
        name: phasesToRender.length > 1 ? `Fase ${phaseKey}` : resolvedMetricLabel,
        data: getChartSeries(phaseKey, metricKey, timeFrameKey)
    }));

    const phaseColors: Record<PhaseType, string> = {
        A: "#5750F1",
        B: "#0ABEF9",
        C: "#F2994A",
    };

    const chartColors = phasesToRender.length > 1
        ? phasesToRender.map((phaseKey) => phaseColors[phaseKey])
        : ["#5750F1"];
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
    const pickerGroupClassName = compact
        ? "flex w-full flex-wrap items-center gap-2 sm:w-auto"
        : "flex flex-wrap items-center gap-2";

    return (
        <div
            className={containerClassName}
        >
            <div className={headerClassName}>
                <h2 className={titleClassName}>
                    {resolvedMetricLabel} ({resolvedTimeFrameLabel})
                </h2>

                <div className={pickerGroupClassName}>
                    <div className={compact ? "w-full sm:w-auto" : undefined}>
                        <PeriodPicker
                            defaultValue={resolvedMetricLabel}
                            sectionKey={"metric"}
                            items={Object.keys(METRIC_MAP)}
                        />
                    </div>

                    <div className={compact ? "w-full sm:w-auto" : undefined}>
                        <PeriodPicker
                            defaultValue={resolvedTimeFrameLabel}
                            sectionKey={"time_frame"}
                            items={Object.keys(TIME_FRAME_MAP)}
                        />
                    </div>
                </div>
            </div>

            <PaymentsOverviewChart series={series} colors={chartColors} />
        </div>
    );
}
