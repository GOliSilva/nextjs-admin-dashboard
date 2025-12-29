import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getInfoGeraisMetricas } from "@/services/info-gerais.services";

type PropsType = {
  className?: string;
};

const formatMetric = (value: number, unit?: string) => {
  const formatted = standardFormat(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

export async function InfoGeraisMetricas({ className }: PropsType) {
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

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
            Indicadores
          </h2>
          <p className="text-sm text-dark-6">Resumo operacional</p>
        </div>
        <span className="rounded-full border border-stroke px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dark-6 dark:border-dark-3">
          Geral
        </span>
      </div>

      <div className="mt-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          {items.map((item, index) => (
            <div key={item.label} className="flex items-start justify-between">
              <div>
                <dd className="text-sm font-semibold uppercase tracking-wide text-dark-6">
                  {item.label}
                </dd>
                <dt className="mt-3 text-2xl font-bold text-dark dark:text-white">
                  {item.value}
                </dt>
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
