"use client";

import { useEffect, useState } from "react";
import { PeriodPicker } from "@/components/period-picker";
import { useDeviceSelection } from "@/contexts/device-selection-context";
import {
  buildConsumoOverviewSeries,
  type DailyEnergyDoc,
} from "@/lib/daily-energy";
import { formatMeasurementValue } from "@/lib/format-measurement";
import { getDailyEnergyData } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { getPaymentsOverviewData } from "@/services/charts.services";
import { getGeracaoSeries, type GeracaoPeriod } from "@/services/geracao.services";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  title?: string;
  sectionKey?: string;
  timeFrameItems?: string[];
  mode?: string;
  modeSectionKey?: string;
  modeItems?: string[];
  compact?: boolean;
};

type SeriesItem = {
  name: string;
  data: { x: unknown; y: number }[];
};

type ConsumoPeriod = "semanal" | "diario";

type ViewState = {
  series: SeriesItem[];
  chartColors?: string[];
  yUnit?: string;
};

const EMPTY_STATE: ViewState = {
  series: [],
  chartColors: undefined,
  yUnit: undefined,
};

const sumSeries = (series: SeriesItem) => {
  return series.data.reduce((acc, point) => acc + point.y, 0);
};

const normalizePeriod = (value?: string): ConsumoPeriod & GeracaoPeriod => {
  return value === "diario" ? "diario" : "semanal";
};

const normalizeMode = (value?: string) => {
  return value === "geracao" ? "geracao" : "consumo";
};

const getModeLabel = (value: string) => {
  if (value === "geracao") {
    return "Potencia";
  }

  if (value === "consumo") {
    return "Consumo";
  }

  return value;
};

export function PaymentsOverview({
  timeFrame,
  className,
  title = "Payments Overview",
  sectionKey = "payments_overview",
  timeFrameItems,
  mode,
  modeSectionKey,
  modeItems,
  compact,
}: PropsType) {
  const { selectedDeviceId } = useDeviceSelection();
  const showModePicker = Boolean(modeSectionKey);
  const normalizedMode = normalizeMode(mode);
  const resolvedTitle =
    showModePicker && title === "Payments Overview"
      ? getModeLabel(normalizedMode)
      : title;
  const resolvedModeItems = (modeItems ?? ["consumo", "geracao"]).map((item) => ({
    value: item,
    label: getModeLabel(item),
  }));
  const resolvedPeriod = normalizePeriod(timeFrame);
  const resolvedTimeFrame = showModePicker ? resolvedPeriod : timeFrame ?? "monthly";
  const showTimeFramePicker =
    !showModePicker || normalizedMode === "consumo" || normalizedMode === "geracao";
  const [viewState, setViewState] = useState<ViewState>(EMPTY_STATE);

  useEffect(() => {
    if (showModePicker && normalizedMode === "consumo") {
      setViewState({
        series: [{ name: "Consumo", data: buildConsumoOverviewSeries([], resolvedPeriod) }],
        chartColors: ["#0ABEF9"],
        yUnit: "kWh",
      });

      return getDailyEnergyData((docs: DailyEnergyDoc[]) => {
        setViewState({
          series: [
            {
              name: "Consumo",
              data: buildConsumoOverviewSeries(docs, resolvedPeriod),
            },
          ],
          chartColors: ["#0ABEF9"],
          yUnit: "kWh",
        });
      }, selectedDeviceId);
    }

    let isMounted = true;

    const loadData = async () => {
      if (showModePicker && normalizedMode === "geracao") {
        const { direta, reversa } = await getGeracaoSeries(resolvedPeriod);
        if (!isMounted) {
          return;
        }

        setViewState({
          series: [
            { name: "Consumo", data: direta },
            { name: "Geracao", data: reversa },
          ],
          chartColors: undefined,
          yUnit: "kWh",
        });
        return;
      }

      const data = await getPaymentsOverviewData(resolvedTimeFrame);
      if (!isMounted) {
        return;
      }

      setViewState({
        series: [
          { name: "Received", data: data.received },
          { name: "Due", data: data.due },
        ],
        chartColors: undefined,
        yUnit: undefined,
      });
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [
    normalizedMode,
    resolvedPeriod,
    resolvedTimeFrame,
    selectedDeviceId,
    showModePicker,
  ]);

  const summaryItems = showModePicker
    ? viewState.series.map((item) => ({
        label: item.name,
        value: formatMeasurementValue(sumSeries(item), viewState.yUnit, { withSpace: true }),
      }))
    : [
        {
          label: "Received Amount",
          value: formatMeasurementValue(sumSeries(viewState.series[0] ?? { name: "", data: [] })),
        },
        {
          label: "Due Amount",
          value: formatMeasurementValue(sumSeries(viewState.series[1] ?? { name: "", data: [] })),
        },
      ];

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
        <h2 className={titleClassName}>{resolvedTitle}</h2>

        <div className={pickerGroupClassName}>
          {showModePicker && (
            <div className={compact ? "w-full sm:w-auto" : undefined}>
              <PeriodPicker
                defaultValue={normalizedMode}
                sectionKey={modeSectionKey ?? "overview_mode"}
                items={resolvedModeItems}
              />
            </div>
          )}

          {showTimeFramePicker && (
            <div className={compact ? "w-full sm:w-auto" : undefined}>
              <PeriodPicker
                defaultValue={resolvedTimeFrame}
                sectionKey={sectionKey}
                items={timeFrameItems}
              />
            </div>
          )}
        </div>
      </div>

      <PaymentsOverviewChart
        series={viewState.series}
        colors={viewState.chartColors}
        yUnit={viewState.yUnit}
      />

      <dl
        className={cn(
          "grid divide-stroke text-center dark:divide-dark-3 [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1",
          summaryItems.length > 1 && "sm:grid-cols-2 sm:divide-x",
        )}
      >
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              summaryItems.length > 1 &&
                index === 0 &&
                "dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3",
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
