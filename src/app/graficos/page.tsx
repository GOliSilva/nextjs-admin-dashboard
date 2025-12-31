import { Suspense } from "react";
import { OverviewCardsGroup } from "@/app/(home)/_components/overview-cards";
import { OverviewCardsSkeleton } from "@/app/(home)/_components/overview-cards/skeleton";
import { GraficosChart } from "./_components/graficos-chart";
import { Metadata } from "next";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";

export const metadata: Metadata = {
  title: "Graficos",
};

type Props = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function GraficosPage({ searchParams }: Props) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <GraficosChart
          title="Tensao"
          metric="tensao"
          timeFrame={extractTimeFrame("graficos_tensao")?.split(":")[1]}
          sectionKey="graficos_tensao"
          className="col-span-12 xl:col-span-6"
        />
        <GraficosChart
          title="Corrente"
          metric="corrente"
          timeFrame={extractTimeFrame("graficos_corrente")?.split(":")[1]}
          sectionKey="graficos_corrente"
          className="col-span-12 xl:col-span-6"
        />
        <GraficosChart
          title="Fator de potencia"
          metric="fator_potencia"
          timeFrame={extractTimeFrame("graficos_fator_potencia")?.split(":")[1]}
          sectionKey="graficos_fator_potencia"
          className="col-span-12 xl:col-span-6"
        />
        <GraficosChart
          title="Potencia"
          metric="potencia"
          timeFrame={extractTimeFrame("graficos_potencia")?.split(":")[1]}
          sectionKey="graficos_potencia"
          className="col-span-12 xl:col-span-6"
        />
      </div>
    </>
  );
}
