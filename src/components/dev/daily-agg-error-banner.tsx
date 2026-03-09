"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";

function formatTimestamp(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    const date = (value as { toDate: () => Date }).toDate();
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

export function DailyAggErrorBanner() {
  const { dailyAggError } = useFirebaseData();

  if (process.env.NODE_ENV !== "development" || !dailyAggError) {
    return null;
  }

  const message =
    typeof dailyAggError.message === "string"
      ? dailyAggError.message
      : "Erro desconhecido no salvamento de daily_agg";
  const errorType =
    typeof dailyAggError.errorType === "string"
      ? dailyAggError.errorType
      : "UnknownError";
  const dayKey =
    typeof dailyAggError.dayKey === "string" ? dailyAggError.dayKey : "-";
  const eventId =
    typeof dailyAggError.eventId === "string" ? dailyAggError.eventId : "-";
  const loggedAt =
    formatTimestamp(dailyAggError.loggedAt) ??
    formatTimestamp(dailyAggError.eventAt);

  return (
    <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p className="font-semibold">DEV: Falha ao salvar daily_agg</p>
      <p>{message}</p>
      <p>
        type={errorType} dayKey={dayKey} eventId={eventId}
        {loggedAt ? ` loggedAt=${loggedAt}` : ""}
      </p>
    </div>
  );
}
