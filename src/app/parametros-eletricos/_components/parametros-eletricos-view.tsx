"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";

type MetricConfig = {
  key: string;
  label: string;
  description: string;
  unit?: string;
};

type GroupConfig = {
  id: string;
  title: string;
  subtitle: string;
  metrics: MetricConfig[];
};

const GROUPS: GroupConfig[] = [
  {
    id: "tensoes",
    title: "Tensões",
    subtitle: "Medições de tensão por fase",
    metrics: [
      { key: "Va", label: "Fase A", description: "Tensão da fase A", unit: "V" },
      { key: "Vb", label: "Fase B", description: "Tensão da fase B", unit: "V" },
      { key: "Vc", label: "Fase C", description: "Tensão da fase C", unit: "V" },
    ],
  },
  {
    id: "correntes",
    title: "Correntes",
    subtitle: "Medições de corrente por fase e neutro",
    metrics: [
      { key: "Ia", label: "Fase A", description: "Corrente da fase A", unit: "A" },
      { key: "Ib", label: "Fase B", description: "Corrente da fase B", unit: "A" },
      { key: "Ic", label: "Fase C", description: "Corrente da fase C", unit: "A" },
      { key: "In", label: "Neutro", description: "Corrente no neutro", unit: "A" },
    ],
  },
  {
    id: "angulos",
    title: "Ângulos",
    subtitle: "Referências angulares de tensão e corrente",
    metrics: [
      { key: "angVa", label: "Ângulo Va", description: "Ângulo da tensão A", unit: "°" },
      { key: "angVb", label: "Ângulo Vb", description: "Ângulo da tensão B", unit: "°" },
      { key: "angVc", label: "Ângulo Vc", description: "Ângulo da tensão C", unit: "°" },
      { key: "angIa", label: "Ângulo Ia", description: "Ângulo da corrente A", unit: "°" },
      { key: "angIb", label: "Ângulo Ib", description: "Ângulo da corrente B", unit: "°" },
      { key: "angIc", label: "Ângulo Ic", description: "Ângulo da corrente C", unit: "°" },
    ],
  },
  {
    id: "potencias",
    title: "Potências",
    subtitle: "Potências por fase e totais",
    metrics: [
      { key: "Pa", label: "Ativa A", description: "Potência ativa da fase A", unit: "W" },
      { key: "Pb", label: "Ativa B", description: "Potência ativa da fase B", unit: "W" },
      { key: "Pc", label: "Ativa C", description: "Potência ativa da fase C", unit: "W" },
      { key: "Pdir", label: "Ativa total", description: "Potência ativa total", unit: "W" },
      { key: "Prev", label: "Reativa total", description: "Potência reativa total", unit: "var" },
      { key: "Q", label: "Aparente total", description: "Potência aparente total", unit: "var" },
      { key: "S", label: "Total", description: "Potência total", unit: "VA" },
    ],
  },
  {
    id: "fator-potencia",
    title: "Fator de potência",
    subtitle: "Fator de potência por fase e consolidado",
    metrics: [
      { key: "Ph", label: "Total", description: "Fator de potência total" },
      { key: "fpa", label: "Fase A", description: "Fator de potência da fase A" },
      { key: "fpb", label: "Fase B", description: "Fator de potência da fase B" },
      { key: "fpc", label: "Fase C", description: "Fator de potência da fase C" },
      { key: "fpt", label: "Global", description: "Fator de potência global" },
    ],
  },
  {
    id: "energia",
    title: "Energia",
    subtitle: "Energia ativa acumulada por fase",
    metrics: [
      { key: "Ea", label: "Fase A", description: "Energia ativa da fase A", unit: "kWh" },
      { key: "Eb", label: "Fase B", description: "Energia ativa da fase B", unit: "kWh" },
      { key: "Ec", label: "Fase C", description: "Energia ativa da fase C", unit: "kWh" },
    ],
  },
  {
    id: "gerais",
    title: "Gerais",
    subtitle: "Variáveis complementares do sistema",
    metrics: [
      { key: "f", label: "Frequência", description: "Frequência da rede", unit: "Hz" },
      { key: "t", label: "Temperatura", description: "Temperatura medida", unit: "°C" },
    ],
  },
];

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toMillis(value: unknown) {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  if (typeof value === "string") {
    const millis = new Date(value).getTime();
    return Number.isNaN(millis) ? null : millis;
  }
  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    const millis = (value as { toDate: () => Date }).toDate().getTime();
    return Number.isNaN(millis) ? null : millis;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as { seconds?: unknown }).seconds === "number"
  ) {
    const seconds = (value as { seconds: number }).seconds;
    const nanos =
      "nanoseconds" in value && typeof (value as { nanoseconds?: unknown }).nanoseconds === "number"
        ? (value as { nanoseconds: number }).nanoseconds
        : 0;
    return seconds * 1000 + Math.floor(nanos / 1_000_000);
  }
  return null;
}

function formatRelativeTime(updatedAtMs: number | null, nowMs: number, isLoading: boolean) {
  if (isLoading) return "Sincronizando";
  if (updatedAtMs == null) return "Sem atualização recente";

  const delta = Math.max(0, nowMs - updatedAtMs);
  if (delta < 15_000) return "Atualizado agora";
  if (delta < 60_000) return `Atualizado há ${Math.floor(delta / 1000)}s`;
  if (delta < 3_600_000) return `Atualizado há ${Math.floor(delta / 60_000)}min`;
  return `Atualizado há ${Math.floor(delta / 3_600_000)}h`;
}

function formatMetricValue(value: number | null, unit?: string) {
  if (value == null) return "--";
  const formatted = standardFormat(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function ParametrosEletricosView() {
  const { data, isLoading } = useFirebaseData();
  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(intervalId);
  }, []);

  const latestData = (data ?? {}) as Record<string, unknown>;
  const updatedLabel = formatRelativeTime(toMillis(data?.createdAt), nowMs, isLoading);

  const visibleGroups = useMemo(() => {
    if (activeGroupId === "all") return GROUPS;
    return GROUPS.filter((group) => group.id === activeGroupId);
  }, [activeGroupId]);

  return (
    <div className="flex flex-col gap-4 md:gap-6 2xl:gap-7.5">
      <section className="rounded-[14px] border border-stroke bg-white p-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Parâmetros Elétricos</h1>
            <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
              Leitura mais recente de todas as variáveis elétricas organizadas por domínio.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-stroke px-3 py-1.5 text-sm font-medium text-dark-5 dark:border-stroke-dark dark:text-dark-6">
            <span
              className={cn(
                "size-2.5 rounded-full",
                isLoading ? "animate-pulse bg-amber-500" : "bg-emerald-500",
              )}
            />
            {updatedLabel}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveGroupId("all")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              activeGroupId === "all"
                ? "border-primary bg-primary text-white"
                : "border-stroke bg-transparent text-dark-5 hover:border-primary hover:text-primary dark:border-stroke-dark dark:text-dark-6",
            )}
          >
            Todos
          </button>

          {GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroupId(group.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                activeGroupId === group.id
                  ? "border-primary bg-primary text-white"
                  : "border-stroke bg-transparent text-dark-5 hover:border-primary hover:text-primary dark:border-stroke-dark dark:text-dark-6",
              )}
            >
              {group.title}
            </button>
          ))}
        </div>
      </section>

      <div className={cn("grid gap-4 md:gap-6", visibleGroups.length > 1 && "xl:grid-cols-2")}>
        {visibleGroups.map((group) => (
          <section
            key={group.id}
            className="rounded-[14px] border border-stroke bg-white p-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:p-5"
          >
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-dark dark:text-white">{group.title}</h2>
              <p className="text-sm text-dark-5 dark:text-dark-6">{group.subtitle}</p>
            </div>

            <Table wrapperClassName="max-h-[360px] overflow-y-auto">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[26%]">Variável</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[28%] text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.metrics.map((metric) => {
                  const numeric = toNumber(latestData[metric.key]);
                  return (
                    <TableRow key={metric.key}>
                      <TableCell>
                        <div className="font-mono text-sm font-semibold text-dark dark:text-white">
                          {metric.key}
                        </div>
                        <div className="text-xs text-dark-5 dark:text-dark-6">{metric.label}</div>
                      </TableCell>
                      <TableCell className="text-sm text-dark-5 dark:text-dark-6">
                        {metric.description}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-dark dark:text-white">
                        {formatMetricValue(numeric, metric.unit)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
        ))}
      </div>
    </div>
  );
}
