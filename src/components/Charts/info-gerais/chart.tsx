"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

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
  const isMobile = useIsMobile();
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
      width: isMobile ? 2 : 3,
    },
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
    <div className="-ml-4 -mr-5 h-[320px]">
      <Chart
        options={options}
        series={series}
        type="line"
        height={320}
      />
    </div>
  );
}
