import consumoForaPonta from "@/data/consumo-fora-ponta.json";
import consumoPonta from "@/data/consumo-ponta.json";

export type ConsumoPontaMode = "ponta" | "fora ponta";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const toSeries = (source: Record<string, string | undefined>) => {
  return MONTHS.map((month) => {
    const value = source[month];
    const numeric = Number.parseFloat(value ?? "");

    return {
      x: month,
      y: Number.isFinite(numeric) ? numeric : 0,
    };
  });
};

export async function getConsumoPontaSeries(mode: ConsumoPontaMode) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const source = mode === "fora ponta" ? consumoForaPonta : consumoPonta;

  return {
    thisYear: toSeries(source.thisYear),
    lastYear: toSeries(source.lastYear),
  };
}
