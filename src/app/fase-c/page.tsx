import { Suspense } from "react";
import { PhaseCards } from "@/components/phase-dashboard/phase-cards";
import { PhaseChart } from "@/components/phase-dashboard/phase-chart";
import { PhaseEnergyChart } from "@/components/phase-dashboard/phase-energy-chart";
import { PhaseInfo } from "@/components/phase-dashboard/phase-info";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { OverviewCardsSkeleton } from "@/app/(home)/_components/overview-cards/skeleton";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function FaseCPage({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const metric = extractTimeFrame("metric")?.split(":")[1];
  const timeFrame = extractTimeFrame("time_frame")?.split(":")[1];
  const energyType = extractTimeFrame("energy_type")?.split(":")[1];

  return (
    <div className="flex flex-col gap-4 md:gap-6 2xl:gap-7.5">
      <Suspense fallback={<OverviewCardsSkeleton compact />}>
        <PhaseCards phase="C" compact />
      </Suspense>

      <div className="grid gap-4 md:gap-6 2xl:gap-7.5 xl:grid-cols-12">
        <PhaseChart
          className="xl:col-span-7"
          phase="C"
          metric={metric}
          timeFrame={timeFrame}
          compact
        />

        <PhaseEnergyChart
          className="xl:col-span-5"
          phase="C"
          energyType={energyType}
          compact
        />
      </div>

      <PhaseInfo phase="C" compact />
    </div>
  );
}
