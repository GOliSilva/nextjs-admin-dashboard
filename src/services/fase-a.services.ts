import faseAData from "@/data/faseA.json";

export type FaseAMetrics = keyof typeof faseAData;
export type TimeFrame = "week" | "day";

export async function getFaseAData() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return faseAData;
}

export function getCurrentValue(metric: FaseAMetrics): number {
    const dayData = faseAData[metric].day;
    // Get the last value from the day entries (assuming keys are 1..24)
    const keys = Object.keys(dayData).map(Number).sort((a, b) => a - b);
    const lastKey = keys[keys.length - 1];
    return dayData[lastKey as keyof typeof dayData];
}

export function getChartSeries(metric: FaseAMetrics, timeFrame: TimeFrame) {
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
