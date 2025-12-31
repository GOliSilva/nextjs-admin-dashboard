import type { Metadata } from "next";
import { GraficosChart } from "./_components/graficos-chart";
import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { UsedDevices } from "@/components/Charts/used-devices";
import { ConsumoPorFaseLine } from "@/components/Charts/consumo-por-fase-line";
import { PhaseChart } from "@/components/phase-dashboard/phase-chart";
import { PhaseEnergyChart } from "@/components/phase-dashboard/phase-energy-chart";
import { InfoGeraisPotenciaChart } from "@/components/Charts/info-gerais";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";

export const metadata: Metadata = {
  title: "Gr\u00e1ficos",
};

type Props = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function GraficosPage({ searchParams }: Props) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const graficosTensao = extractTimeFrame("graficos_tensao")?.split(":")[1];
  const graficosCorrente = extractTimeFrame("graficos_corrente")?.split(":")[1];
  const graficosFatorPotencia =
    extractTimeFrame("graficos_fator_potencia")?.split(":")[1];
  const graficosPotencia =
    extractTimeFrame("graficos_potencia")?.split(":")[1];

  const overviewMode = extractTimeFrame("overview_mode")?.split(":")[1];
  const overviewPeriod = extractTimeFrame("overview_period")?.split(":")[1];
  const weeksProfit = extractTimeFrame("weeks_profit")?.split(":")[1];
  const usedDevices = extractTimeFrame("used_devices")?.split(":")[1];
  const consumoPorFase = extractTimeFrame("consumos_por_fase")?.split(":")[1];

  const metric = extractTimeFrame("metric")?.split(":")[1];
  const timeFrame = extractTimeFrame("time_frame")?.split(":")[1];
  const energyType = extractTimeFrame("energy_type")?.split(":")[1];

  const infoGeraisPeriod =
    extractTimeFrame("info_gerais_period")?.split(":")[1];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-dark dark:text-white">
          {"Vis\u00e3o geral"}
        </h2>
        <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <GraficosChart
            title={"Tens\u00e3o"}
            metric="tensao"
            timeFrame={graficosTensao}
            sectionKey="graficos_tensao"
            className="col-span-12 xl:col-span-6"
          />
          <GraficosChart
            title={"Corrente"}
            metric="corrente"
            timeFrame={graficosCorrente}
            sectionKey="graficos_corrente"
            className="col-span-12 xl:col-span-6"
          />
          <GraficosChart
            title={"Fator de pot\u00eancia"}
            metric="fator_potencia"
            timeFrame={graficosFatorPotencia}
            sectionKey="graficos_fator_potencia"
            className="col-span-12 xl:col-span-6"
          />
          <GraficosChart
            title={"Pot\u00eancia"}
            metric="potencia"
            timeFrame={graficosPotencia}
            sectionKey="graficos_potencia"
            className="col-span-12 xl:col-span-6"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-dark dark:text-white">
          {"Consumo"}
        </h2>
        <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <PaymentsOverview
            className="col-span-12 xl:col-span-7"
            timeFrame={overviewPeriod}
            sectionKey="overview_period"
            mode={overviewMode}
            modeSectionKey="overview_mode"
            modeItems={["consumo", "geracao"]}
            timeFrameItems={["semanal", "diario"]}
            title={"Consumo e gera\u00e7\u00e3o"}
          />

          <WeeksProfit
            className="col-span-12 xl:col-span-5"
            timeFrame={weeksProfit}
          />

          <UsedDevices
            className="col-span-12 xl:col-span-5"
            timeFrame={usedDevices}
          />

          <ConsumoPorFaseLine
            className="col-span-12 xl:col-span-7"
            timeFrame={consumoPorFase}
            title={"Consumo por fase (linha)"}
            sectionKey="consumos_por_fase"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-dark dark:text-white">
          {"Fases"}
        </h2>
        <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <div className="col-span-12">
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              {"Fase A"}
            </h3>
          </div>
          <PhaseChart
            className="col-span-12 xl:col-span-7"
            phase="A"
            metric={metric}
            timeFrame={timeFrame}
          />
          <PhaseEnergyChart
            className="col-span-12 xl:col-span-5"
            phase="A"
            energyType={energyType}
          />

          <div className="col-span-12">
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              {"Fase B"}
            </h3>
          </div>
          <PhaseChart
            className="col-span-12 xl:col-span-7"
            phase="B"
            metric={metric}
            timeFrame={timeFrame}
          />
          <PhaseEnergyChart
            className="col-span-12 xl:col-span-5"
            phase="B"
            energyType={energyType}
          />

          <div className="col-span-12">
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              {"Fase C"}
            </h3>
          </div>
          <PhaseChart
            className="col-span-12 xl:col-span-7"
            phase="C"
            metric={metric}
            timeFrame={timeFrame}
          />
          <PhaseEnergyChart
            className="col-span-12 xl:col-span-5"
            phase="C"
            energyType={energyType}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-dark dark:text-white">
          {"Informa\u00e7\u00f5es adicionais"}
        </h2>
        <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <InfoGeraisPotenciaChart
            className="col-span-12 xl:col-span-8"
            timeFrame={infoGeraisPeriod}
            sectionKey="info_gerais_period"
            title={"Pot\u00eancias gerais"}
          />
        </div>
      </section>
    </div>
  );
}
