"use client";

import { formatMeasurementValue } from "@/lib/format-measurement";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { apexSeriesAnimationPreset } from "@/lib/apex-animations";

type PropsType = {
  data: { name: string; amount: number }[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function DonutChart({ data }: PropsType) {
  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      animations: apexSeriesAnimationPreset,
    },
    colors: ["#0ABEF9", "#22C55E", "#F59E0B"],
    labels: data.map((item) => item.name),
    legend: {
      show: true,
      position: "bottom",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: (legendName, opts) => {
        const { seriesPercent } = opts.w.globals;
        const percent = Math.round(seriesPercent[opts.seriesIndex]);
        return `${legendName}: ${percent}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total (kWh)",
              fontSize: "16px",
              fontWeight: "400",
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
              formatter: (val) => formatMeasurementValue(Number(val), "kWh"),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => formatMeasurementValue(Number(val), "kWh"),
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
      {
        breakpoint: 370,
        options: {
          chart: {
            width: 260,
          },
        },
      },
    ],
  };

  return (
    <Chart
      options={chartOptions}
      series={data.map((item) => item.amount)}
      type="donut"
    />
  );
}
