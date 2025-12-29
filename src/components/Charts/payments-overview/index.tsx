import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getPaymentsOverviewData } from "@/services/charts.services";
import { getConsumoSeries } from "@/services/consumo.services";
import { getGeracaoSeries } from "@/services/geracao.services";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
  title?: string;
  sectionKey?: string;
  timeFrameItems?: string[];
  mode?: string;
  modeSectionKey?: string;
  modeItems?: string[];
};

type SeriesItem = {
  name: string;
  data: { x: unknown; y: number }[];
};

const sumSeries = (series: SeriesItem) => {
  return series.data.reduce((acc, point) => acc + point.y, 0);
};

const normalizePeriod = (value?: string) => {
  return value === "semanal" ? "semanal" : "anual";
};

const normalizeMode = (value?: string) => {
  return value === "geracao" ? "geracao" : "consumo";
};

export async function PaymentsOverview({
  timeFrame,
  className,
  title = "Payments Overview",
  sectionKey = "payments_overview",
  timeFrameItems,
  mode,
  modeSectionKey,
  modeItems,
}: PropsType) {
  const showModePicker = Boolean(modeSectionKey);
  const normalizedMode = normalizeMode(mode);
  const resolvedTimeFrame = showModePicker
    ? normalizePeriod(timeFrame)
    : timeFrame ?? "monthly";
  const showTimeFramePicker =
    !showModePicker || normalizedMode === "consumo" || normalizedMode === "geracao";

  let series: SeriesItem[] = [];
  let summaryItems: { label: string; value: string }[] = [];
  let chartColors: string[] | undefined;

  if (showModePicker) {
    if (normalizedMode === "consumo") {
      const consumoSeries = await getConsumoSeries(resolvedTimeFrame);

      series = [
        {
          name: "Consumo",
          data: consumoSeries,
        },
      ];
      chartColors = ["#0ABEF9"];
    } else {
      const { direta, reversa } = await getGeracaoSeries(resolvedTimeFrame);

      series = [
        {
          name: "Geracao direta",
          data: direta,
        },
        {
          name: "Geracao reversa",
          data: reversa,
        },
      ];
    }

    summaryItems = series.map((item) => ({
      label: item.name,
      value: standardFormat(sumSeries(item)),
    }));
  } else {
    const data = await getPaymentsOverviewData(resolvedTimeFrame);

    series = [
      {
        name: "Received",
        data: data.received,
      },
      {
        name: "Due",
        data: data.due,
      },
    ];

    summaryItems = [
      {
        label: "Received Amount",
        value: `$${standardFormat(sumSeries(series[0]))}`,
      },
      {
        label: "Due Amount",
        value: `$${standardFormat(sumSeries(series[1]))}`,
      },
    ];
  }

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          {title}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {showModePicker && (
            <PeriodPicker
              defaultValue={normalizedMode}
              sectionKey={modeSectionKey ?? "overview_mode"}
              items={modeItems ?? ["consumo", "geracao"]}
            />
          )}

          {showTimeFramePicker && (
            <PeriodPicker
              defaultValue={resolvedTimeFrame}
              sectionKey={sectionKey}
              items={timeFrameItems}
            />
          )}
        </div>
      </div>

      <PaymentsOverviewChart series={series} colors={chartColors} />

      <dl
        className={cn(
          "grid divide-stroke text-center dark:divide-dark-3 [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1",
          summaryItems.length > 1 && "sm:grid-cols-2 sm:divide-x",
        )}
      >
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              summaryItems.length > 1 &&
                index === 0 &&
                "dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3",
            )}
          >
            <dt className="text-xl font-bold text-dark dark:text-white">
              {item.value}
            </dt>
            <dd className="font-medium dark:text-dark-6">{item.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
