import { ConsumoPorFaseLine } from "@/components/Charts/consumo-por-fase-line";
import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { UsedDevices } from "@/components/Charts/used-devices";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const overviewMode = extractTimeFrame("overview_mode")?.split(":")[1];
  const overviewPeriod = extractTimeFrame("overview_period")?.split(":")[1];

  return (
    <>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <PaymentsOverview
          className="col-span-12 xl:col-span-7"
          key={`overview-${overviewMode ?? "consumo"}-${overviewPeriod ?? "semanal"}`}
          timeFrame={overviewPeriod}
          sectionKey="overview_period"
          mode={overviewMode}
          modeSectionKey="overview_mode"
          modeItems={["consumo", "geracao"]}
          timeFrameItems={["semanal", "diario"]}
        />

        <WeeksProfit
          key={extractTimeFrame("weeks_profit")}
          timeFrame={extractTimeFrame("weeks_profit")?.split(":")[1]}
          className="col-span-12 xl:col-span-5"
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
          key={extractTimeFrame("used_devices")}
          timeFrame={extractTimeFrame("used_devices")?.split(":")[1]}
        />

        <ConsumoPorFaseLine
          className="col-span-12 xl:col-span-7"
          key={extractTimeFrame("consumos_por_fase")}
          timeFrame={
            extractTimeFrame("consumos_por_fase")?.split(":")[1] ?? "semanal"
          }
          title="Consumos por fase"
          sectionKey="consumos_por_fase"
        />
      </div>
    </>
  );
}
