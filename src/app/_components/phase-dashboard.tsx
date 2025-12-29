import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { UsedDevices } from "@/components/Charts/used-devices";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { OverviewCardsGroup } from "../(home)/_components/overview-cards";
import { OverviewCardsSkeleton } from "../(home)/_components/overview-cards/skeleton";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
  phaseKey: string;
};

const withPhaseKey = (phaseKey: string, key: string) => `${phaseKey}_${key}`;

export async function PhaseDashboard({ searchParams, phaseKey }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const overviewMode = extractTimeFrame(withPhaseKey(phaseKey, "overview_mode"))
    ?.split(":")[1];
  const overviewPeriod = extractTimeFrame(
    withPhaseKey(phaseKey, "overview_period"),
  )?.split(":")[1];

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <PaymentsOverview
          className="col-span-12 xl:col-span-7"
          key={`overview-${phaseKey}-${overviewMode ?? "consumo"}-${overviewPeriod ?? "anual"}`}
          timeFrame={overviewPeriod}
          sectionKey={withPhaseKey(phaseKey, "overview_period")}
          mode={overviewMode}
          modeSectionKey={withPhaseKey(phaseKey, "overview_mode")}
          modeItems={["consumo", "geracao"]}
          timeFrameItems={["anual", "semanal"]}
        />

        <WeeksProfit
          key={extractTimeFrame(withPhaseKey(phaseKey, "weeks_profit"))}
          timeFrame={
            extractTimeFrame(withPhaseKey(phaseKey, "weeks_profit"))?.split(
              ":",
            )[1]
          }
          className="col-span-12 xl:col-span-5"
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
          key={extractTimeFrame(withPhaseKey(phaseKey, "used_devices"))}
          timeFrame={
            extractTimeFrame(withPhaseKey(phaseKey, "used_devices"))?.split(
              ":",
            )[1]
          }
        />

        <PaymentsOverview
          className="col-span-12 xl:col-span-7"
          key={extractTimeFrame(withPhaseKey(phaseKey, "consumos_por_fase"))}
          timeFrame={
            extractTimeFrame(withPhaseKey(phaseKey, "consumos_por_fase"))?.split(
              ":",
            )[1]
          }
          title="Consumos por fase"
          sectionKey={withPhaseKey(phaseKey, "consumos_por_fase")}
        />
      </div>
    </>
  );
}
