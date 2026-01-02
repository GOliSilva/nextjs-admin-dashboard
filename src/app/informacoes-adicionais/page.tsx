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
    <div className="flex flex-col gap-4 md:gap-6 2xl:gap-7.5">
      <Suspense fallback={<OverviewCardsSkeleton compact />}>
        <InfoGeraisCards compact />
      </Suspense>

      <div className="grid gap-4 md:gap-6 2xl:gap-7.5 xl:grid-cols-12">
        <InfoGeraisPotenciaChart
          className="xl:col-span-8"
          timeFrame={potenciaPeriod}
          sectionKey="info_gerais_period"
          compact
        />

        <InfoGeraisMetricas className="xl:col-span-4" compact />
      </div>
    </div>
  );
}
