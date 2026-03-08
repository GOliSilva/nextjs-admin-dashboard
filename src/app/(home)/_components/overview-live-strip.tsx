"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

type MetricKey =
  | "energyTotal"
  | "Va"
  | "Vb"
  | "Vc"
  | "Ia"
  | "Ib"
  | "Ic"
  | "Pa"
  | "Pb"
  | "Pc";

type MetricValues = Record<MetricKey, number | null>;
type ChangedMap = Partial<Record<MetricKey, boolean>>;

const HIGHLIGHT_DURATION_MS = 900;

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

function sum(values: Array<number | null>) {
  const filtered = values.filter((item): item is number => item !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((acc, item) => acc + item, 0);
}

function formatValue(value: number | null, unit: string) {
  if (value === null) return "--";
  return `${standardFormat(value)} ${unit}`;
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

type PhaseMetricProps = {
  title: string;
  keys: [MetricKey, MetricKey, MetricKey];
  values: MetricValues;
  unit: string;
  changed: ChangedMap;
};

function PhaseMetricGroup({ title, keys, values, unit, changed }: PhaseMetricProps) {
  const labels = ["A", "B", "C"] as const;

  return (
    <section className="min-w-full snap-start px-4 py-3 md:min-w-0 md:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dark-5 dark:text-dark-6">
        {title}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {labels.map((phase, index) => {
          const key = keys[index];
          return (
            <div
              key={phase}
              className={cn(
                "rounded-lg border border-stroke/80 bg-white/70 px-2.5 py-2 transition-colors duration-700 dark:border-stroke-dark dark:bg-white/5",
                changed[key] && "border-primary/60 bg-primary/10 dark:bg-primary/20",
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-dark-5 dark:text-dark-6">
                {phase}
              </p>
              <p className="mt-1 text-xs font-semibold text-dark dark:text-white sm:text-sm">
                {formatValue(values[key], unit)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function OverviewLiveStrip() {
  const { data, isLoading } = useFirebaseData();
  const [changed, setChanged] = useState<ChangedMap>({});
  const [nowMs, setNowMs] = useState(() => Date.now());
  const previousValuesRef = useRef<MetricValues | null>(null);

  const metrics = useMemo<MetricValues>(() => {
    const va = toNumber(data?.Va);
    const vb = toNumber(data?.Vb);
    const vc = toNumber(data?.Vc);
    const ia = toNumber(data?.Ia);
    const ib = toNumber(data?.Ib);
    const ic = toNumber(data?.Ic);
    const pa = toNumber(data?.Pa);
    const pb = toNumber(data?.Pb);
    const pc = toNumber(data?.Pc);
    const energyTotal = sum([toNumber(data?.Ea), toNumber(data?.Eb), toNumber(data?.Ec)]);

    return {
      energyTotal,
      Va: va,
      Vb: vb,
      Vc: vc,
      Ia: ia,
      Ib: ib,
      Ic: ic,
      Pa: pa,
      Pb: pb,
      Pc: pc,
    };
  }, [data]);

  useEffect(() => {
    const previous = previousValuesRef.current;
    previousValuesRef.current = metrics;
    if (previous == null) return;

    const changedKeys = (Object.keys(metrics) as MetricKey[]).filter((key) => {
      const previousValue = previous[key];
      const currentValue = metrics[key];
      return previousValue !== null && currentValue !== null && previousValue !== currentValue;
    });

    if (changedKeys.length === 0) return;

    setChanged((current) => {
      const next = { ...current };
      changedKeys.forEach((key) => {
        next[key] = true;
      });
      return next;
    });

    const timeoutId = setTimeout(() => {
      setChanged((current) => {
        const next = { ...current };
        changedKeys.forEach((key) => {
          delete next[key];
        });
        return next;
      });
    }, HIGHLIGHT_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [metrics]);

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(intervalId);
  }, []);

  const updatedLabel = formatRelativeTime(toMillis(data?.createdAt), nowMs, isLoading);

  return (
    <div className="overflow-hidden rounded-xl border border-stroke bg-gradient-to-r from-[#f7f9ff] via-white to-[#f2f6ff] dark:border-stroke-dark dark:from-[#0C1629] dark:via-[#0A1322] dark:to-[#0E1B31]">
      <div className="flex items-center justify-between gap-3 border-b border-stroke/70 px-4 py-2 dark:border-stroke-dark">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dark-5 dark:text-dark-6">
          Pulso da rede
        </p>
        <p className="text-xs font-medium text-dark-4 dark:text-dark-6">{updatedLabel}</p>
      </div>

      <div className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible">
        <section className="min-w-full snap-start px-4 py-3 md:min-w-0 md:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dark-5 dark:text-dark-6">
            Energia total do mês
          </p>
          <p
            className={cn(
              "mt-2 inline-block rounded-lg border border-stroke/80 bg-white/80 px-3 py-1.5 text-base font-bold tracking-tight text-dark transition-colors duration-700 dark:border-stroke-dark dark:bg-white/5 dark:text-white sm:text-xl",
              changed.energyTotal && "border-primary/60 bg-primary/10 text-primary dark:bg-primary/20",
            )}
          >
            {formatValue(metrics.energyTotal, "kWh")}
          </p>
        </section>

        <PhaseMetricGroup
          title="Tensão"
          keys={["Va", "Vb", "Vc"]}
          values={metrics}
          unit="V"
          changed={changed}
        />
        <PhaseMetricGroup
          title="Corrente"
          keys={["Ia", "Ib", "Ic"]}
          values={metrics}
          unit="A"
          changed={changed}
        />
        <PhaseMetricGroup
          title="Potência"
          keys={["Pa", "Pb", "Pc"]}
          values={metrics}
          unit="W"
          changed={changed}
        />
      </div>
    </div>
  );
}
