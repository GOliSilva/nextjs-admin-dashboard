"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

type PropsType = {
    categories: string[];
    anoAtual: number[];
    anoAnterior: number[];
};

export function EnergyChart({ categories, anoAtual, anoAnterior }: PropsType) {
    const options: ApexOptions = {
        colors: ["#5750F1", "#808080"], // Blue for Current, Gray for Previous
        chart: {
            type: "bar",
            stacked: false, // Side by side for comparison
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        responsive: [
            {
                breakpoint: 1536,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 3,
                            columnWidth: "50%",
                        },
                    },
                },
            },
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 3,
                columnWidth: "50%",
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        xaxis: {
            categories: categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        legend: {
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
        fill: {
            opacity: 1,
        },
    };

    return (
        <div className="-ml-3.5 mt-3">
            <Chart
                options={options}
                series={[
                    {
                        name: "Ano Atual",
                        data: anoAtual,
                    },
                    {
                        name: "Ano Anterior",
                        data: anoAnterior,
                    },
                ]}
                type="bar"
                height={370}
            />
        </div>
    );
}
