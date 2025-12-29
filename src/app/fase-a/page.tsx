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

export default async function FaseAPage({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const metric = extractTimeFrame("metric")?.split(":")[1];
  const timeFrame = extractTimeFrame("time_frame")?.split(":")[1];
  const energyType = extractTimeFrame("energy_type")?.split(":")[1];

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <PhaseCards phase="A" />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
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
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-9">
        <PhaseInfo phase="A" />
      </div>
    </>
  );
}
