"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { apexSeriesAnimationPreset } from "@/lib/apex-animations";
import { formatMeasurementValue } from "@/lib/format-measurement";
import { useEffect, useState } from "react";

type PropsType = {
  series: {
    name: string;
    data: { x: unknown; y: number }[];
  }[];
  colors?: string[];
  yUnit?: string;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function PaymentsOverviewChart({ series, colors, yUnit }: PropsType) {
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [enableSeriesTransitions, setEnableSeriesTransitions] = useState(false);

  const normalizeTimestampNumber = (value: number) => {
    if (!Number.isFinite(value)) {
      return null;
    }

    const absValue = Math.abs(value);

    if (absValue > 1e14) {
      return Math.floor(value / 1000);
    }

    if (absValue >= 1e12) {
      return value;
    }

    if (absValue >= 1e9) {
      return value * 1000;
    }

    return null;
  };

  const normalizeX = (value: unknown) => {
    if (value == null) {
      return null;
    }

    if (typeof value === "number") {
      return normalizeTimestampNumber(value) ?? String(value);
    }

    if (value instanceof Date) {
      const time = value.getTime();
      return Number.isFinite(time) ? time : null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      const numeric = Number.parseFloat(trimmed);
      if (Number.isFinite(numeric) && /^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
        return normalizeTimestampNumber(numeric) ?? trimmed;
      }

      const looksLikeIsoDate =
        /^\d{4}-\d{2}-\d{2}/.test(trimmed) ||
        /^\d{4}\/\d{2}\/\d{2}/.test(trimmed);
      if (looksLikeIsoDate) {
        const parsed = new Date(trimmed).getTime();
        return Number.isFinite(parsed) ? parsed : null;
      }

      return trimmed;
    }

    if (typeof value === "object") {
      const maybeTimestamp = value as {
        toMillis?: () => number;
        toDate?: () => Date;
        seconds?: number;
        nanoseconds?: number;
      };

      if (typeof maybeTimestamp.toMillis === "function") {
        const time = maybeTimestamp.toMillis();
        if (!Number.isFinite(time)) {
          return null;
        }
        return time > 1e14 ? Math.floor(time / 1000) : time;
      }

      if (typeof maybeTimestamp.toDate === "function") {
        const time = maybeTimestamp.toDate().getTime();
        return Number.isFinite(time) ? time : null;
      }

      if (typeof maybeTimestamp.seconds === "number") {
        const nanos =
          typeof maybeTimestamp.nanoseconds === "number"
            ? maybeTimestamp.nanoseconds
            : 0;
        return maybeTimestamp.seconds * 1000 + Math.floor(nanos / 1e6);
      }
    }

    return null;
  };

  const normalizedSeries = series.map((item) => ({
    ...item,
    data: (item.data ?? [])
      .map((point) => {
        const xValue = normalizeX(point.x);
        if (
          xValue == null ||
          (typeof xValue !== "number" && typeof xValue !== "string")
        ) {
          return null;
        }

        const yValue = Number.isFinite(point.y) ? point.y : 0;
        return { x: xValue, y: yValue };
      })
      .filter((point): point is { x: number | string; y: number } => point !== null),
  }));

  const hasData = normalizedSeries.some(
    (item) => item.data && item.data.length > 0,
  );

  useEffect(() => {
    if (!hasData) {
      setEnableSeriesTransitions(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setEnableSeriesTransitions(true);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasData]);

  const timestamps = normalizedSeries
    .flatMap((item) => item.data.map((point) => point.x))
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );
  const hasDatetimeX = timestamps.length > 0;
  const rangeMs =
    hasDatetimeX ? Math.max(...timestamps) - Math.min(...timestamps) : 0;
  const isIntradayRange = hasDatetimeX && rangeMs < 24 * 60 * 60 * 1000;
  const labelOptions: Intl.DateTimeFormatOptions =
    !isIntradayRange
      ? { day: "2-digit", month: "2-digit" }
      : { hour: "2-digit", minute: "2-digit" };
  const formatDateTime = (value: string | number) => {
    const numeric = typeof value === "number" ? value : Number.parseFloat(value);
    if (!Number.isFinite(numeric)) {
      return String(value);
    }
    return new Date(numeric).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const categoryLabels = hasDatetimeX
    ? []
    : normalizedSeries[0]?.data.map((point) => String(point.x)) ?? [];
  const resolveCategoryLabel = (value: string | number) => {
    const raw = String(value);
    if (categoryLabels.includes(raw)) {
      return raw;
    }

    const numeric = typeof value === "number" ? value : Number.parseFloat(value);
    if (Number.isFinite(numeric)) {
      const index = Math.round(numeric);
      if (categoryLabels[index - 1] != null) {
        return categoryLabels[index - 1];
      }
      if (categoryLabels[index] != null) {
        return categoryLabels[index];
      }
    }

    return raw;
  };
  const chartSeries = hasDatetimeX
    ? normalizedSeries
    : normalizedSeries.map((item) => ({
        ...item,
        data: item.data.map((point) => point.y),
      }));
  const formatAxisLabel = (value: string | number) => {
    const numeric = typeof value === "number" ? value : Number.parseFloat(value);
    if (!Number.isFinite(numeric)) {
      return String(value);
    }
    return new Date(numeric).toLocaleString("pt-BR", labelOptions);
  };
  const formatTooltipX = (value: string | number) =>
    hasDatetimeX
      ? isIntradayRange
        ? formatDateTime(value)
        : formatAxisLabel(value)
      : resolveCategoryLabel(value);
  const maxXTicks = 12;
  const dataPoints = normalizedSeries.reduce(
    (max, item) => Math.max(max, item.data.length),
    0,
  );
  const xTickAmount =
    dataPoints > 0 ? Math.min(maxXTicks, dataPoints) : maxXTicks;

  const formatChartValue = (value: number | string) => {
    const numeric = typeof value === "number" ? value : Number.parseFloat(value);
    return formatMeasurementValue(Number.isFinite(numeric) ? numeric : 0, yUnit);
  };

  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: colors ?? ["#5750F1", "#0ABEF9"],
    chart: {
      height: 310,
      type: "area",
      animations: {
        ...apexSeriesAnimationPreset,
        dynamicAnimation: {
          ...apexSeriesAnimationPreset.dynamicAnimation,
          enabled: enableSeriesTransitions,
        },
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      selection: {
        enabled: true,
      },
      fontFamily: "inherit",
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 850,
        options: {
          stroke: {
            width: 2,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      marker: {
        show: true,
      },
      x: {
        show: true,
        formatter: formatTooltipX,
      },
      y: {
        formatter: formatChartValue,
      },
    },
    xaxis: {
      ...(hasDatetimeX ? { tickAmount: xTickAmount } : {}),
      type: hasDatetimeX ? "datetime" : "category",
      ...(hasDatetimeX ? {} : { categories: categoryLabels }),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: -45,
        rotateAlways: true,
        formatter: hasDatetimeX ? formatAxisLabel : resolveCategoryLabel,
      },
    },
    yaxis: {
      labels: {
        formatter: formatChartValue,
      },
    },
  };

  return (
    <div
      className={`-ml-4 h-[310px] relative transition-all ${
        isZoomEnabled ? "z-20 rounded-lg" : ""
      }`}
    >
      {!hasData ? (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          Carregando dados...
        </div>
      ) : (
        <>
          {!isZoomEnabled && (
            <button
              type="button"
              className="absolute inset-0 z-10 min-[850px]:hidden"
              onClick={() => setIsZoomEnabled(true)}
            />
          )}
          <Chart
            options={options}
            series={chartSeries}
            type="area"
            height={310}
          />
          {isZoomEnabled && (
            <button
              onClick={() => setIsZoomEnabled(false)}
              className="absolute top-2 right-2 z-20 rounded-md bg-primary p-1.5 text-white shadow-lg transition-colors hover:bg-primary/90 min-[850px]:hidden"
              aria-label="Sair do modo zoom"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
