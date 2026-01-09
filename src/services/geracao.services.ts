import geracaoData from "@/data/geracao.json";

export type GeracaoPeriod = "semanal" | "diario";

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

  const key = period === "diario" ? "day" : "week";

  return {
    direta: toSeries(geracaoData.direta[key]),
    reversa: toSeries(geracaoData.reversa[key]),
  };
}
