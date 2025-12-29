import faseAData from "@/data/faseA.json";

export type FaseAMetrics = keyof typeof faseAData;
export type TimeFrame = "week" | "day";

export async function getFaseAData() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return faseAData;
}

export function getCurrentValue(metric: FaseAMetrics): number {
    if (metric === "energia" || metric === "fase") return 0; // Not applicable for get current value in this context
    const dayData = faseAData[metric].day;
    // Get the last value from the day entries (assuming keys are 1..24)
    const keys = Object.keys(dayData).map(Number).sort((a, b) => a - b);
    const lastKey = keys[keys.length - 1];
    return dayData[lastKey as keyof typeof dayData];
}

export function getChartSeries(metric: FaseAMetrics, timeFrame: TimeFrame) {
    if (metric === "energia" || metric === "fase") return [];
    const data = faseAData[metric][timeFrame];

    if (timeFrame === "week") {
        // Ensure order: Segunda, Terca, ...
        const weekOrder = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"];
        return weekOrder.map(day => ({
            x: day,
            y: data[day as keyof typeof data]
        }));
    } else {
        // Ensure order: 1..24
        const keys = Object.keys(data).map(Number).sort((a, b) => a - b);
        return keys.map(hour => ({
            x: `${hour}h`,
            y: data[hour as keyof typeof data]
        }));
    }
}

export function getEnergiaData(type: "ponta" | "nao_ponta") {
    const data = faseAData.energia[type];
    const months = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Return fixed months order
    const anoAtual = months.map(m => data.ano_atual[m as keyof typeof data.ano_atual]);
    const anoAnterior = months.map(m => data.ano_anterior[m as keyof typeof data.ano_anterior]);

    return {
        categories: months,
        anoAtual,
        anoAnterior
    };
}

export function getFaseInfo() {
    return faseAData.fase;
}
