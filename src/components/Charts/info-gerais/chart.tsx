"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";

type PropsType = {
  series: {
    name: string;
    data: { x: unknown; y: number }[];
  }[];
  colors?: string[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function InfoGeraisLineChart({ series, colors }: PropsType) {
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const maxXTicks = 12;
  const dataPoints = series.reduce(
    (max, item) => Math.max(max, item.data.length),
    0,
  );
  const xTickAmount =
    dataPoints > 0 ? Math.min(maxXTicks, dataPoints) : maxXTicks;

  const getUnitForSeries = (seriesName?: string) => {
    const name = seriesName?.toLowerCase() ?? "";

    if (name.includes("reativa")) {
      return "Var";
    }

    if (name.includes("complexa")) {
      return "Va";
    }

    return "W";
  };

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "inherit",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        size: 9,
        shape: "circle",
      },
    },
    colors: colors ?? ["#5750F1", "#0ABEF9", "#22C55E"],
    chart: {
      height: 320,
      type: "line",
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
    stroke: {
      curve: "smooth",
      width: 3,
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
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
    markers: {
      size: 0,
      hover: {
        sizeOffset: 4,
      },
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
      y: {
        formatter: (value, { seriesIndex, w }) => {
          const seriesName = w?.config?.series?.[seriesIndex]?.name;
          const unit = getUnitForSeries(seriesName);
          return `${value.toFixed(2)} ${unit}`;
        },
      },
    },
    xaxis: {
      tickAmount: xTickAmount,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
  };

  return (
    <div
      className={`-ml-4 -mr-5 h-[320px] relative transition-all ${
        isZoomEnabled ? "z-20 ring-2 ring-primary rounded-lg" : ""
      }`}
    >
      {!isZoomEnabled && (
        <button
          type="button"
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 text-xs font-semibold text-dark/80 backdrop-blur-[1px] min-[850px]:hidden"
          onClick={() => setIsZoomEnabled(true)}
        >
          Toque para ativar o zoom
        </button>
      )}
      <Chart options={options} series={series} type="line" height={320} />
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
    </div>
  );
}
