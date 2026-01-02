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

export default async function ConsumoPage({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const overviewMode = extractTimeFrame("overview_mode")?.split(":")[1];
  const overviewPeriod = extractTimeFrame("overview_period")?.split(":")[1];

  return (
    <div className="grid gap-4 md:gap-6 2xl:gap-7.5 xl:grid-cols-12">
      <PaymentsOverview
        className="xl:col-span-7"
        key={`overview-${overviewMode ?? "consumo"}-${overviewPeriod ?? "semanal"}`}
        timeFrame={overviewPeriod}
        sectionKey="overview_period"
        mode={overviewMode}
        modeSectionKey="overview_mode"
        modeItems={["consumo", "geracao"]}
        timeFrameItems={["semanal", "diario"]}
        compact
      />

      <div className="flex gap-3 overflow-x-auto pb-1 sm:contents">
        <WeeksProfit
          key={extractTimeFrame("weeks_profit")}
          timeFrame={extractTimeFrame("weeks_profit")?.split(":")[1]}
          className="min-w-[220px] shrink-0 sm:min-w-0 xl:col-span-5"
          compact
        />

        <UsedDevices
          className="min-w-[220px] shrink-0 sm:min-w-0 xl:col-span-5"
          key={extractTimeFrame("used_devices")}
          timeFrame={extractTimeFrame("used_devices")?.split(":")[1]}
          compact
        />
      </div>

      <ConsumoPorFaseLine
        className="xl:col-span-7"
        key={extractTimeFrame("consumos_por_fase")}
        timeFrame={
          extractTimeFrame("consumos_por_fase")?.split(":")[1] ?? "semanal"
        }
        title="Consumos por fase"
        sectionKey="consumos_por_fase"
        compact
      />
    </div>
  );
}
