export type DailyEnergyEntry = {
  eventAt?: unknown;
  periodType?: string;
  deltas?: Record<string, unknown>;
  deltaTotalEvento?: unknown;
};

export type DailyEnergyDoc = {
  id: string;
  dayKey?: string;
  deltaEntries?: DailyEnergyEntry[];
};

const HOUR_LABELS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const PHASES = [
  { name: "Fase A", field: "Ea" },
  { name: "Fase B", field: "Eb" },
  { name: "Fase C", field: "Ec" },
] as const;

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toMillis(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    const millis = new Date(value).getTime();
    return Number.isFinite(millis) ? millis : null;
  }

  if (value && typeof value === "object") {
    const maybeTimestamp = value as {
      toMillis?: () => number;
      toDate?: () => Date;
      seconds?: number;
      nanoseconds?: number;
    };

    if (typeof maybeTimestamp.toMillis === "function") {
      const millis = maybeTimestamp.toMillis();
      return Number.isFinite(millis) ? millis : null;
    }

    if (typeof maybeTimestamp.toDate === "function") {
      const millis = maybeTimestamp.toDate().getTime();
      return Number.isFinite(millis) ? millis : null;
    }

    if (typeof maybeTimestamp.seconds === "number") {
      const nanos =
        typeof maybeTimestamp.nanoseconds === "number"
          ? maybeTimestamp.nanoseconds
          : 0;
      return maybeTimestamp.seconds * 1000 + Math.floor(nanos / 1e6);
    }
  }

  return null;
}

function buildDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMonthPrefix(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-`;
}

function getRecentDayKeys(totalDays: number) {
  const days: string[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let index = totalDays - 1; index >= 0; index -= 1) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() - index);
    days.push(buildDayKey(day));
  }

  return days;
}

function getEntries(doc: DailyEnergyDoc | undefined) {
  return Array.isArray(doc?.deltaEntries) ? doc.deltaEntries : [];
}

function getDocMap(docs: DailyEnergyDoc[]) {
  return new Map(
    docs
      .map((doc) => [String(doc.dayKey ?? doc.id), doc] as const)
      .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key)),
  );
}

function sumEntries(entries: DailyEnergyEntry[]) {
  return entries.reduce((total, entry) => total + toNumber(entry.deltaTotalEvento), 0);
}

function sumPhaseEntries(entries: DailyEnergyEntry[], field: string) {
  return entries.reduce((total, entry) => {
    const deltas = entry.deltas;
    if (!deltas || typeof deltas !== "object") {
      return total;
    }

    return total + toNumber(deltas[field]);
  }, 0);
}

function formatDayLabel(dayKey: string) {
  const parts = dayKey.split("-");
  if (parts.length !== 3) {
    return dayKey;
  }

  return `${parts[2]}/${parts[1]}`;
}

export function buildConsumoOverviewSeries(
  docs: DailyEnergyDoc[],
  period: "diario" | "semanal",
) {
  const docMap = getDocMap(docs);

  if (period === "diario") {
    const entries = getEntries(docMap.get(buildDayKey(new Date())));
    const buckets = new Map(HOUR_LABELS.map((label) => [label, 0]));

    entries.forEach((entry) => {
      const eventMs = toMillis(entry.eventAt);
      if (eventMs == null) {
        return;
      }

      const hour = String(new Date(eventMs).getHours()).padStart(2, "0");
      buckets.set(hour, (buckets.get(hour) ?? 0) + toNumber(entry.deltaTotalEvento));
    });

    return HOUR_LABELS.map((label) => ({
      x: label,
      y: buckets.get(label) ?? 0,
    }));
  }

  return getRecentDayKeys(7).map((dayKey) => ({
    x: formatDayLabel(dayKey),
    y: sumEntries(getEntries(docMap.get(dayKey))),
  }));
}

export function buildConsumoPorFaseSeries(
  docs: DailyEnergyDoc[],
  period: "diario" | "semanal",
) {
  const docMap = getDocMap(docs);

  if (period === "diario") {
    const entries = getEntries(docMap.get(buildDayKey(new Date())));

    return PHASES.map(({ name, field }) => {
      const buckets = new Map(HOUR_LABELS.map((label) => [label, 0]));

      entries.forEach((entry) => {
        const eventMs = toMillis(entry.eventAt);
        if (eventMs == null) {
          return;
        }

        const deltas = entry.deltas;
        if (!deltas || typeof deltas !== "object") {
          return;
        }

        const hour = String(new Date(eventMs).getHours()).padStart(2, "0");
        buckets.set(hour, (buckets.get(hour) ?? 0) + toNumber(deltas[field]));
      });

      return {
        name,
        data: HOUR_LABELS.map((label) => ({
          x: label,
          y: buckets.get(label) ?? 0,
        })),
      };
    });
  }

  const dayKeys = getRecentDayKeys(7);
  return PHASES.map(({ name, field }) => ({
    name,
    data: dayKeys.map((dayKey) => ({
      x: formatDayLabel(dayKey),
      y: sumPhaseEntries(getEntries(docMap.get(dayKey)), field),
    })),
  }));
}

export function buildConsumoPorFaseBreakdown(
  docs: DailyEnergyDoc[],
  period: "semanal" | "mensal",
) {
  const docMap = getDocMap(docs);
  const dayKeys =
    period === "mensal"
      ? Array.from(docMap.keys())
          .filter((dayKey) => dayKey.startsWith(buildMonthPrefix(new Date())))
          .sort((left, right) => left.localeCompare(right))
      : getRecentDayKeys(7);

  return PHASES.map(({ name, field }) => ({
    name,
    amount: dayKeys.reduce(
      (total, dayKey) => total + sumPhaseEntries(getEntries(docMap.get(dayKey)), field),
      0,
    ),
  }));
}
