import consumoSemanal from "@/data/consumoSemanal.json";

type SeriesPoint = { x: string; y: number };

const toSeries = (source: Record<string, string>): SeriesPoint[] => {
  return Object.entries(source).map(([x, value]) => {
    const numeric = Number.parseFloat(value);

    return {
      x,
      y: Number.isFinite(numeric) ? numeric : 0,
    };
  });
};

export async function getConsumoSemanalData() {

  const thisWeek = toSeries(consumoSemanal);
  const lastWeek = thisWeek.map((point) => ({
    x: point.x,
    y: Number.parseFloat((point.y * 0.9).toFixed(2)),
  }));

  return { thisWeek, lastWeek };
}
