import metricasData from "@/data/infoGerais-metricas.json";
import potenciasData from "@/data/infoGerais-potencias.json";
import potenciaAtivaData from "@/data/infoGerais-potencia-ativa.json";
import potenciaComplexaData from "@/data/infoGerais-potencia-complexa.json";
import potenciaReativaData from "@/data/infoGerais-potencia-reativa.json";

export type InfoGeraisPeriod = "semanal" | "diario";

type SeriesPoint = {
  x: string;
  y: number;
};

const parseNumber = (value: string) => {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const toSeries = (source: Record<string, string>): SeriesPoint[] => {
  return Object.entries(source).map(([x, value]) => ({
    x,
    y: parseNumber(value),
  }));
};

export async function getInfoGeraisPotencias() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    direta: parseNumber(potenciasData.direta),
    reversa: parseNumber(potenciasData.reversa),
    reativa: parseNumber(potenciasData.reativa),
    complexa: parseNumber(potenciasData.complexa),
  };
}

export async function getInfoGeraisPotenciaSeries(period: InfoGeraisPeriod) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const key = period === "diario" ? "day" : "week";

  return [
    {
      name: "Pot\u00EAncia ativa",
      data: toSeries(potenciaAtivaData[key]),
    },
    {
      name: "Pot\u00EAncia reativa",
      data: toSeries(potenciaReativaData[key]),
    },
    {
      name: "Pot\u00EAncia complexa",
      data: toSeries(potenciaComplexaData[key]),
    },
  ];
}

export async function getInfoGeraisMetricas() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    correnteNeutro: parseNumber(metricasData.correnteNeutro),
    dht: parseNumber(metricasData.dht),
    fatorPotenciaTotal: parseNumber(metricasData.fatorPotenciaTotal),
    frequencia: parseNumber(metricasData.frequencia),
  };
}
