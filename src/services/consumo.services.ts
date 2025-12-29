import consumoData from "@/data/consumo.json";

export type ConsumoPeriod = "anual" | "semanal";

const toSeries = (source: Record<string, string>) => {
  return Object.entries(source).map(([x, value]) => {
    const numeric = Number.parseFloat(value);

    return {
      x,
      y: Number.isFinite(numeric) ? numeric : 0,
    };
  });
};

export async function getConsumoSeries(period: ConsumoPeriod) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const key = period === "semanal" ? "week" : "year";

  return toSeries(consumoData[key]);
}
