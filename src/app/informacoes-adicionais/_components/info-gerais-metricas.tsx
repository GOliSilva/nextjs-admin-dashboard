import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getInfoGeraisMetricas } from "@/services/info-gerais.services";

type PropsType = {
  className?: string;
  compact?: boolean;
};

const formatMetric = (value: number, unit?: string) => {
  const formatted = standardFormat(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

export async function InfoGeraisMetricas({ className, compact }: PropsType) {
  const metricas = await getInfoGeraisMetricas();

  const items = [
    {
      label: "Corrente de neutro",
      value: formatMetric(metricas.correnteNeutro, "A"),
    },
    {
      label: "Distor\u00E7\u00E3o harm\u00F4nica",
      value: formatMetric(metricas.dht, "%"),
    },
    {
      label: "Fator de pot\u00EAncia total",
      value: formatMetric(metricas.fatorPotenciaTotal),
    },
    {
      label: "Frequ\u00EAncia",
      value: formatMetric(metricas.frequencia, "Hz"),
    },
  ];

  const containerClassName = cn(
    "rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card",
    compact ? "p-4 sm:p-6" : "p-6",
    className,
  );
  const headerClassName = compact
    ? "flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between"
    : "flex items-center justify-between gap-4";
  const titleClassName = cn(
    "font-bold text-dark dark:text-white",
    compact ? "text-lg sm:text-body-2xlg" : "text-body-2xlg",
  );
  const subtitleClassName = cn(
    "text-dark-6",
    compact ? "text-xs sm:text-sm" : "text-sm",
  );
  const badgeClassName = cn(
    "rounded-full border border-stroke font-semibold uppercase tracking-wide text-dark-6 dark:border-dark-3",
    compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1 text-xs",
  );
  const listClassName = compact
    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5"
    : "grid grid-cols-2 gap-x-6 gap-y-5";
  const itemLabelClassName = cn(
    "font-semibold uppercase tracking-wide text-dark-6",
    compact ? "text-[10px] sm:text-xs" : "text-sm",
  );
  const itemValueClassName = cn(
    "font-bold text-dark dark:text-white",
    compact ? "mt-2 text-lg sm:text-2xl" : "mt-3 text-2xl",
  );
  const listSpacingClassName = compact ? "mt-4 sm:mt-6" : "mt-6";

  return (
    <div className={containerClassName}>
      <div className={headerClassName}>
        <div>
          <h2 className={titleClassName}>Indicadores</h2>
          <p className={subtitleClassName}>Resumo operacional</p>
        </div>
        <span className={badgeClassName}>Geral</span>
      </div>

      <div className={listSpacingClassName}>
        <dl className={listClassName}>
          {items.map((item, index) => (
            <div key={item.label} className="flex items-start justify-between">
              <div>
                <dd className={itemLabelClassName}>{item.label}</dd>
                <dt className={itemValueClassName}>{item.value}</dt>
              </div>
              <span
                className={cn(
                  "mt-1 block h-3 w-3 rounded-full",
                  index === 0 && "bg-[#0ABEF9]",
                  index === 1 && "bg-[#22C55E]",
                  index === 2 && "bg-[#F59E0B]",
                  index === 3 && "bg-[#5750F1]",
                )}
              />
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
