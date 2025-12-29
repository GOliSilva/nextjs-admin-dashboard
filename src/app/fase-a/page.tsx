import { Suspense } from "react";
import { FaseACards } from "./_components/fase-a-cards";
import { FaseAChart } from "./_components/fase-a-chart";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { UsedDevices } from "@/components/Charts/used-devices";
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

  // Preserve keys for other charts if they rely on specific frame keys or defaults
  // Assuming they handle undefined gracefully or have defaults.

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <FaseACards />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <FaseAChart
          className="col-span-12 xl:col-span-7"
          metric={metric}
          timeFrame={timeFrame}
        />

        <WeeksProfit
          className="col-span-12 xl:col-span-5"
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
        />
      </div>
    </>
  );
}
