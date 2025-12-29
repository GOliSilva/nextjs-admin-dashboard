import consumoMensal from "@/data/consumo-por-fase-mensal.json";
import consumoSemanal from "@/data/consumo-por-fase-semanal.json";

export type ConsumoFasePeriodo = "semanal" | "mensal";

const toSeries = (source: Record<string, string>) => {
  return Object.entries(source).map(([name, value]) => {
    const numeric = Number.parseFloat(value);

    return {
      name,
      amount: Number.isFinite(numeric) ? numeric : 0,
    };
  });
};

export async function getConsumoPorFase(periodo: ConsumoFasePeriodo) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const source = periodo === "mensal" ? consumoMensal : consumoSemanal;

  return toSeries(source);
}
