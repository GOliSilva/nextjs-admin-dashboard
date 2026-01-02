"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";

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
  const [isChartFocused, setIsChartFocused] = useState(false);
  const [isMobileReady, setIsMobileReady] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const maxXTicks = 12;
  const dataPoints = series.reduce(
    (max, item) => Math.max(max, item.data.length),
    0,
  );
  const xTickAmount =
    dataPoints > 0 ? Math.min(maxXTicks, dataPoints) : maxXTicks;

  // Aguarda isMobile estar pronto
  useEffect(() => {
    setIsMobileReady(true);
  }, []);

  // Controla pointer-events do gráfico baseado no estado de foco
  useEffect(() => {
    if (!isMobileReady || isMobile === undefined) return;

    const setPointerEvents = () => {
      const chartEl = chartInstanceRef.current?.el || chartContainerRef.current?.querySelector(".apexcharts-canvas");
      if (chartEl && isMobile === true) {
        chartEl.style.pointerEvents = isChartFocused ? "auto" : "none";
      } else if (chartEl && isMobile === false) {
        chartEl.style.pointerEvents = "auto";
      }
    };

    setPointerEvents();
    const timeoutId = setTimeout(setPointerEvents, 150);

    return () => clearTimeout(timeoutId);
  }, [isChartFocused, isMobile, isMobileReady]);

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
        enabled: isMobile === true ? isChartFocused : true, // Mobile: só com foco, Desktop: sempre
        type: "x",
        autoScaleYaxis: true,
      },
      selection: {
        enabled: isMobile === true ? isChartFocused : true, // Mobile: só com foco, Desktop: sempre
      },
      fontFamily: "inherit",
      events: {
        mounted: (chartContext) => {
          chartInstanceRef.current = chartContext;
          const chartEl = chartContext.el;
          if (chartEl) {
            if (isMobile === true && !isChartFocused) {
              chartEl.style.pointerEvents = "none";
            } else if (isMobile === false) {
              chartEl.style.pointerEvents = "auto";
            }
          }
        },
        updated: (chartContext) => {
          const chartEl = chartContext.el;
          if (chartEl) {
            if (isMobile === true) {
              chartEl.style.pointerEvents = isChartFocused ? "auto" : "none";
            } else {
              chartEl.style.pointerEvents = "auto";
            }
          }
        },
      },
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
      enabled: isMobile === true ? isChartFocused : true, // Mobile: só com foco, Desktop: sempre
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile !== true) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile !== true) return;
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Considera um "tap" se movimento < 10px e tempo < 300ms
    const isTap = deltaX < 10 && deltaY < 10 && deltaTime < 300;

    if (isTap && !isChartFocused) {
      e.preventDefault(); // Previne comportamento padrão apenas no tap
      setIsChartFocused(true); // Ativa focus no tap
    }
  };

  const handleClickOutside = () => {
    if (isMobile === true && isChartFocused) {
      setIsChartFocused(false);
    }
  };

  return (
    <>
      {isMobile === true && isChartFocused && (
        <div
          className="fixed inset-0 z-10"
          onClick={handleClickOutside}
          onTouchStart={handleClickOutside}
        />
      )}
      <div
        ref={chartContainerRef}
        className={`-ml-4 -mr-5 h-[320px] relative transition-all ${
          isChartFocused ? "z-20 ring-2 ring-primary rounded-lg" : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Chart
          options={options}
          series={series}
          type="line"
          height={320}
        />
        {isMobile === true && isChartFocused && (
          <button
            onClick={() => setIsChartFocused(false)}
            className="absolute top-2 right-2 bg-primary text-white p-1.5 rounded-md shadow-lg hover:bg-primary/90 transition-colors z-30"
            aria-label="Sair do modo zoom"
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
    </>
  );
}
