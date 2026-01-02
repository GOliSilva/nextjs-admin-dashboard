import { Suspense } from "react";
import { OverviewCardsGroup } from "@/app/(home)/_components/overview-cards";
import { OverviewCardsSkeleton } from "@/app/(home)/_components/overview-cards/skeleton";
import { GraficosChart } from "@/app/graficos/_components/graficos-chart";
import type { Metadata } from "next";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";

export const metadata: Metadata = {
  title: "Visao geral",
};

type Props = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <div className="flex flex-col gap-4 md:gap-6 2xl:gap-7.5">
      <Suspense fallback={<OverviewCardsSkeleton compact />}>
        <OverviewCardsGroup compact />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 2xl:gap-7.5">
        <GraficosChart
          title="Tensao"
          metric="tensao"
          timeFrame={extractTimeFrame("graficos_tensao")?.split(":")[1]}
          sectionKey="graficos_tensao"
          compact
        />
        <GraficosChart
          title="Corrente"
          metric="corrente"
          timeFrame={extractTimeFrame("graficos_corrente")?.split(":")[1]}
          sectionKey="graficos_corrente"
          compact
        />
        <GraficosChart
          title="Fator de potencia"
          metric="fator_potencia"
          timeFrame={extractTimeFrame("graficos_fator_potencia")?.split(":")[1]}
          sectionKey="graficos_fator_potencia"
          compact
        />
        <GraficosChart
          title="Potencia"
          metric="potencia"
          timeFrame={extractTimeFrame("graficos_potencia")?.split(":")[1]}
          sectionKey="graficos_potencia"
          compact
        />
      </div>
    </div>
  );
}
