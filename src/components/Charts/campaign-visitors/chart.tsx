"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { apexSeriesAnimationPreset } from "@/lib/apex-animations";
import { standardFormat } from "@/lib/format-number";

type PropsType = {
  data: {
    x: string;
    y: number;
  }[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function CampaignVisitorsChart({ data }: PropsType) {
  const options: ApexOptions = {
    colors: ["#5750F1"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 200,
      animations: apexSeriesAnimationPreset,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 3,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
    },
    grid: {
      strokeDashArray: 7,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => standardFormat(Number(val)),
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val) => standardFormat(Number(val)),
      },
    },
  };

  return (
    <div className="-ml-3.5 px-6 pb-1 pt-7.5">
      <Chart
        options={options}
        series={[
          {
            name: "Visitors",
            data,
          },
        ]}
        type="bar"
        height={230}
      />
    </div>
  );
}
