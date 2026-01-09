import consumoPorFaseLinha from "@/data/consumo-por-fase-linha.json";

export type ConsumoPorFasePeriodo = "semanal" | "diario";

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
const DAY_LABELS = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
];

const toSeries = (
  source: Record<string, Record<string, string>>,
  labels: string[],
) => {
  return Object.entries(source).map(([name, values]) => {
    const data = labels.map((label) => {
      const numeric = Number.parseFloat(values[label] ?? "");

      return {
        x: label,
        y: Number.isFinite(numeric) ? numeric : 0,
      };
    });

    return { name, data };
  });
};

export async function getConsumoPorFaseLinha(periodo: ConsumoPorFasePeriodo) {

  if (periodo === "diario") {
    return toSeries(consumoPorFaseLinha.diario, DAY_LABELS);
  }

  return toSeries(consumoPorFaseLinha.semanal, WEEK_LABELS);
}
