"use client";

import { useEffect, useMemo, useState } from "react";
import { useFirebaseData } from "@/contexts/firebase-data-context";
import { cn } from "@/lib/utils";
import { standardFormat } from "@/lib/format-number";
import {
  DiagramViewMode,
  PhasorDiagram,
  PhasorVector,
} from "./phasor-diagram";

type FamilyKey = "V" | "I";

const VIEW_MODES: Array<{ id: DiagramViewMode; label: string }> = [
  { id: "overlay", label: "Todos" },
  { id: "voltage", label: "Tensão" },
  { id: "current", label: "Corrente" },
];

const PHASE_COLORS = {
  A: "#10b981",
  B: "#f59e0b",
  C: "#f43f5e",
} as const;

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

function getMaxByFamily(vectors: PhasorVector[], family: FamilyKey) {
  const values = vectors
    .filter((vector) => vector.family === family)
    .map((vector) => vector.magnitude)
    .filter((value): value is number => value != null && Number.isFinite(value))
    .map((value) => Math.abs(value));

  if (values.length === 0) return null;
  return Math.max(...values);
}

function formatAngle(value: number | null) {
  if (value == null) return "--";
  return `${standardFormat(value)}Â°`;
}

function formatMagnitude(
  vector: PhasorVector,
) {
  if (vector.magnitude == null) return "--";

  const unit = vector.family === "V" ? "V" : "A";
  return `${standardFormat(vector.magnitude)} ${unit}`;
}

export function FasoresView() {
  const { data, isLoading } = useFirebaseData();
  const [viewMode, setViewMode] = useState<DiagramViewMode>("voltage");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(intervalId);
  }, []);

  const vectors = useMemo<PhasorVector[]>(() => {
    return [
      {
        key: "Va",
        phase: "A",
        family: "V",
        magnitude: toNumber(data?.Va),
        angle: toNumber(data?.angVa),
        color: PHASE_COLORS.A,
      },
      {
        key: "Vb",
        phase: "B",
        family: "V",
        magnitude: toNumber(data?.Vb),
        angle: toNumber(data?.angVb),
        color: PHASE_COLORS.B,
      },
      {
        key: "Vc",
        phase: "C",
        family: "V",
        magnitude: toNumber(data?.Vc),
        angle: toNumber(data?.angVc),
        color: PHASE_COLORS.C,
      },
      {
        key: "Ia",
        phase: "A",
        family: "I",
        magnitude: toNumber(data?.Ia),
        angle: toNumber(data?.angIa),
        color: PHASE_COLORS.A,
        dashed: true,
      },
      {
        key: "Ib",
        phase: "B",
        family: "I",
        magnitude: toNumber(data?.Ib),
        angle: toNumber(data?.angIb),
        color: PHASE_COLORS.B,
        dashed: true,
      },
      {
        key: "Ic",
        phase: "C",
        family: "I",
        magnitude: toNumber(data?.Ic),
        angle: toNumber(data?.angIc),
        color: PHASE_COLORS.C,
        dashed: true,
      },
    ];
  }, [data]);

  const maxByFamily = useMemo(
    () => ({
      V: getMaxByFamily(vectors, "V"),
      I: getMaxByFamily(vectors, "I"),
    }),
    [vectors],
  );

  const visibleVectors = useMemo(() => {
    if (viewMode === "voltage") return vectors.filter((vector) => vector.family === "V");
    if (viewMode === "current") return vectors.filter((vector) => vector.family === "I");
    return vectors;
  }, [vectors, viewMode]);

  const updatedLabel = formatRelativeTime(toMillis(data?.createdAt), nowMs, isLoading);

  const familyGroups = useMemo(() => {
    const order = ["A", "B", "C"] as const;
    const groups: Array<{ family: FamilyKey; title: string; vectors: PhasorVector[] }> = [];

    if (viewMode !== "current") {
      groups.push({
        family: "V",
        title: "Tensão",
        vectors: visibleVectors
          .filter((vector) => vector.family === "V")
          .sort((a, b) => order.indexOf(a.phase) - order.indexOf(b.phase)),
      });
    }

    if (viewMode !== "voltage") {
      groups.push({
        family: "I",
        title: "Corrente",
        vectors: visibleVectors
          .filter((vector) => vector.family === "I")
          .sort((a, b) => order.indexOf(a.phase) - order.indexOf(b.phase)),
      });
    }

    return groups;
  }, [visibleVectors, viewMode]);

  return (
    <div className="flex flex-col gap-4 md:gap-6 2xl:gap-7.5">
      <section className="rounded-[14px] border border-stroke bg-white p-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Fasores</h1>
            <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
              Diagramas fasoriais com os dados mais recentes de tensão e corrente.
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

        <div className="mt-4 overflow-x-auto">
          <div className="inline-flex min-w-full items-center gap-2">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  viewMode === mode.id
                    ? "border-primary bg-primary text-white"
                    : "border-stroke bg-transparent text-dark-5 hover:border-primary hover:text-primary dark:border-stroke-dark dark:text-dark-6",
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] md:gap-6">
        <PhasorDiagram vectors={visibleVectors} viewMode={viewMode} maxByFamily={maxByFamily} />

        <section className="rounded-[14px] border border-stroke bg-white p-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:p-5">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-dark dark:text-white">Leituras instantâneas</h2>
            <p className="text-sm text-dark-5 dark:text-dark-6">
              Módulo e ângulo absoluto por fase no último snapshot.
            </p>
          </div>

          <div className="space-y-4">
            {familyGroups.map((group) => (
              <div key={group.family} className="rounded-xl border border-stroke/80 dark:border-stroke-dark">
                <div className="border-b border-stroke/80 px-3 py-2 dark:border-stroke-dark">
                  <p className="text-sm font-semibold text-dark dark:text-white">{group.title}</p>
                </div>

                <div className="p-3">
                  <div className="grid grid-cols-[60px_minmax(0,1fr)_90px] gap-2 border-b border-stroke/70 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-dark-5 dark:border-stroke-dark dark:text-dark-6">
                    <span>Var.</span>
                    <span>Módulo</span>
                    <span className="text-right">Ângulo</span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {group.vectors.map((vector) => (
                      <div
                        key={vector.key}
                        className="grid grid-cols-[60px_minmax(0,1fr)_90px] items-center gap-2 text-sm"
                      >
                        <span className="font-mono font-semibold text-dark dark:text-white">{vector.key}</span>
                        <span className="font-medium text-dark dark:text-white">
                          {formatMagnitude(vector)}
                        </span>
                        <span className="text-right text-dark-5 dark:text-dark-6">{formatAngle(vector.angle)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-stroke/80 bg-gray-1 px-3 py-2 text-xs text-dark-5 dark:border-stroke-dark dark:bg-white/5 dark:text-dark-6">
            O diagrama usa autoescala visual por família para manter leitura clara entre as fases.
          </div>
        </section>
      </div>
    </div>
  );
}

