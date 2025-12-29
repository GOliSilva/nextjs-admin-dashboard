import { Suspense } from "react";
import { OverviewCardsSkeleton } from "@/app/(home)/_components/overview-cards/skeleton";
import { InfoGeraisPotenciaChart } from "@/components/Charts/info-gerais";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { InfoGeraisCards } from "./_components/info-gerais-cards";
import { InfoGeraisMetricas } from "./_components/info-gerais-metricas";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function InformacoesAdicionais({
  searchParams,
}: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const potenciaPeriod = extractTimeFrame("info_gerais_period")?.split(":")[1];

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <InfoGeraisCards />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <InfoGeraisPotenciaChart
          className="col-span-12 xl:col-span-8"
          timeFrame={potenciaPeriod}
          sectionKey="info_gerais_period"
        />

        <InfoGeraisMetricas className="col-span-12 xl:col-span-4" />
      </div>
    </>
  );
}
