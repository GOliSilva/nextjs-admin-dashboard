import { cn } from "@/lib/utils";

type FamilyKey = "V" | "I";
type PhaseKey = "A" | "B" | "C";

export type DiagramViewMode = "voltage" | "current" | "overlay";

export type PhasorVector = {
  key: string;
  phase: PhaseKey;
  family: FamilyKey;
  magnitude: number | null;
  angle: number | null;
  color: string;
  dashed?: boolean;
};

type Props = {
  vectors: PhasorVector[];
  viewMode: DiagramViewMode;
  maxByFamily: Record<FamilyKey, number | null>;
  className?: string;
};

const CHART_RADIUS = 100;
const RINGS = [0.25, 0.5, 0.75, 1] as const;
const SPOKES = Array.from({ length: 12 }, (_, index) => index * 30);

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function clampZeroToOne(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getScaledMagnitude(magnitude: number | null, familyMax: number | null) {
  if (magnitude == null || !Number.isFinite(magnitude)) return null;
  if (familyMax == null || familyMax <= 0) {
    return magnitude === 0 ? 0 : null;
  }
  return clampZeroToOne(Math.abs(magnitude) / familyMax);
}

export function PhasorDiagram({ vectors, viewMode, maxByFamily, className }: Props) {
  const drawableVectors = vectors
    .map((vector) => {
      if (vector.angle == null || !Number.isFinite(vector.angle)) return null;

      const scaledMagnitude = getScaledMagnitude(vector.magnitude, maxByFamily[vector.family]);
      if (scaledMagnitude == null) return null;

      const radialDistance = scaledMagnitude * CHART_RADIUS;
      const radians = toRadians(vector.angle);
      const x = radialDistance * Math.cos(radians);
      const y = -radialDistance * Math.sin(radians);

      return {
        ...vector,
        scaledMagnitude,
        x,
        y,
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  const hasVectors = drawableVectors.length > 0;
  return (
    <section
      className={cn(
        "rounded-[14px] border border-stroke bg-white p-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:p-5",
        className,
      )}
    >
      <div className="aspect-square w-full">
        <svg viewBox="-140 -140 280 280" className="h-full w-full" role="img" aria-label="Diagrama fasorial">
          {RINGS.map((ratio) => (
            <circle
              key={`ring-${ratio}`}
              cx={0}
              cy={0}
              r={ratio * CHART_RADIUS}
              fill="none"
              stroke="currentColor"
              className="text-stroke dark:text-stroke-dark"
              strokeWidth={ratio === 1 ? 1.25 : 1}
            />
          ))}

          {SPOKES.map((angle) => {
            const radians = toRadians(angle);
            const x = CHART_RADIUS * Math.cos(radians);
            const y = -CHART_RADIUS * Math.sin(radians);
            return (
              <line
                key={`spoke-${angle}`}
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                stroke="currentColor"
                className="text-stroke/70 dark:text-stroke-dark/70"
                strokeWidth={0.75}
              />
            );
          })}

          <line x1={-CHART_RADIUS} y1={0} x2={CHART_RADIUS} y2={0} stroke="currentColor" className="text-dark/30 dark:text-white/30" strokeWidth={1} />
          <line x1={0} y1={-CHART_RADIUS} x2={0} y2={CHART_RADIUS} stroke="currentColor" className="text-dark/30 dark:text-white/30" strokeWidth={1} />

          {drawableVectors.map((vector) => {
            const labelOffsetX = vector.x >= 0 ? 8 : -8;
            const labelOffsetY = vector.y >= 0 ? 12 : -10;
            return (
              <g key={`vector-${vector.key}`}>
                <line
                  x1={0}
                  y1={0}
                  x2={vector.x}
                  y2={vector.y}
                  stroke={vector.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray={vector.dashed ? "6 4" : undefined}
                />
                <circle cx={vector.x} cy={vector.y} r={3.5} fill={vector.color} />
                <text
                  x={vector.x + labelOffsetX}
                  y={vector.y + labelOffsetY}
                  textAnchor={vector.x >= 0 ? "start" : "end"}
                  className="fill-dark text-[11px] font-semibold dark:fill-white"
                >
                  {vector.key}
                </text>
              </g>
            );
          })}

        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-dark-5 dark:text-dark-6">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          Fase A
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500" />
          Fase B
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-500" />
          Fase C
        </span>
        {viewMode === "overlay" ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-4 bg-dark/70 dark:bg-white/70" style={{ borderTop: "2px dashed currentColor" }} />
            Corrente tracejada
          </span>
        ) : null}
      </div>

      {!hasVectors ? (
        <p className="mt-3 text-sm font-medium text-dark-5 dark:text-dark-6">
          Sem vetores válidos no snapshot mais recente.
        </p>
      ) : null}
    </section>
  );
}
