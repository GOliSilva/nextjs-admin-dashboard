import geracaoData from "@/data/geracao.json";

export type GeracaoPeriod = "anual" | "semanal";

const toSeries = (source: Record<string, string>) => {
  return Object.entries(source).map(([x, value]) => {
    const numeric = Number.parseFloat(value);

    return {
      x,
      y: Number.isFinite(numeric) ? numeric : 0,
    };
  });
};

export async function getGeracaoSeries(period: GeracaoPeriod) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const key = period === "semanal" ? "week" : "year";

  return {
    direta: toSeries(geracaoData.direta[key]),
    reversa: toSeries(geracaoData.reversa[key]),
  };
}
