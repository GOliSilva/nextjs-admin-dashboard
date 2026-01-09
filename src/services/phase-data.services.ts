import faseAData from "@/data/faseA.json";
import faseBData from "@/data/faseB.json";
import faseCData from "@/data/faseC.json";

const PHASE_DATA = {
    "A": faseAData,
    "B": faseBData,
    "C": faseCData
};

export type PhaseType = "A" | "B" | "C";
export type PhaseData = typeof faseAData; // Assuming B and C have same structure
export type PhaseMetrics = keyof PhaseData;
export type TimeFrame = "week" | "day";

export async function getPhaseData(phase: PhaseType) {
    return PHASE_DATA[phase];
}

export function getCurrentValue(phase: PhaseType, metric: PhaseMetrics): number {
    if (metric === "energia" || metric === "fase") return 0;

    const data = PHASE_DATA[phase];
    const dayData = (data[metric] as any).day;

    const keys = Object.keys(dayData).map(Number).sort((a, b) => a - b);
    const lastKey = keys[keys.length - 1];
    return dayData[lastKey];
}

export function getChartSeries(phase: PhaseType, metric: PhaseMetrics, timeFrame: TimeFrame) {
    if (metric === "energia" || metric === "fase") return [];

    const data = PHASE_DATA[phase];
    const metricData = (data[metric] as any)[timeFrame];

    if (timeFrame === "week") {
        const weekOrder = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"];
        return weekOrder.map(day => ({
            x: day,
            y: metricData[day]
        }));
    } else {
        const keys = Object.keys(metricData).map(Number).sort((a, b) => a - b);
        return keys.map(hour => ({
            x: `${hour}h`,
            y: metricData[hour]
        }));
    }
}

export function getEnergiaData(phase: PhaseType, type: "ponta" | "nao_ponta") {
    const data = PHASE_DATA[phase];
    const energiaData = data.energia[type];
    const months = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const anoAtual = months.map(m => (energiaData.ano_atual as any)[m]);
    const anoAnterior = months.map(m => (energiaData.ano_anterior as any)[m]);

    return {
        categories: months,
        anoAtual,
        anoAnterior
    };
}

export function getFaseInfo(phase: PhaseType) {
    return PHASE_DATA[phase].fase;
}
