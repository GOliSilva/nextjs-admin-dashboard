import { formatCurrentWithSIPrefix } from "@/lib/format-current";
import { standardFormat } from "@/lib/format-number";

type FormatMeasurementOptions = {
  withSpace?: boolean;
};

const MINOR_PREFIX_THRESHOLD = 1;
const BASE_PREFIX_THRESHOLD = 1_000;
const KILO_PREFIX_THRESHOLD = 1_000_000;
const SI_SCALABLE_UNITS = new Set(["W", "Var", "VA"]);

function roundToTwoDecimals(value: number): number {
  const factor = 100;
  const epsilon = Math.sign(value) * Number.EPSILON;
  return Math.round((value + epsilon) * factor) / factor;
}

function normalizeRounded(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

function stripTrailingZeros(value: number): string {
  const normalized = normalizeRounded(value);
  return normalized.toFixed(2).replace(/\.?0+$/, "");
}

function formatUnitWithSIPrefix(value: number, baseUnit: string): string {
  if (!Number.isFinite(value)) {
    return `0${baseUnit}`;
  }

  if (value === 0) {
    return `0${baseUnit}`;
  }

  const absoluteValue = Math.abs(value);
  let scaled = value;
  let prefix = "";

  if (absoluteValue < MINOR_PREFIX_THRESHOLD) {
    scaled = value * 1_000;
    prefix = "m";
  } else if (absoluteValue < BASE_PREFIX_THRESHOLD) {
    scaled = value;
    prefix = "";
  } else if (absoluteValue < KILO_PREFIX_THRESHOLD) {
    scaled = value / 1_000;
    prefix = "k";
  } else {
    scaled = value / 1_000_000;
    prefix = "M";
  }

  let rounded = roundToTwoDecimals(scaled);

  // Promote unit when rounding reaches 1000 (e.g. 999.995W -> 1kW).
  if (Math.abs(rounded) >= 1_000) {
    if (prefix === "m") {
      rounded = roundToTwoDecimals(value);
      prefix = "";
    } else if (prefix === "") {
      rounded = roundToTwoDecimals(value / 1_000);
      prefix = "k";
    } else if (prefix === "k") {
      rounded = roundToTwoDecimals(value / 1_000_000);
      prefix = "M";
    }
  }

  return `${stripTrailingZeros(rounded)}${prefix}${baseUnit}`;
}

export function formatMeasurementValue(
  value: number,
  unit?: string,
  options?: FormatMeasurementOptions,
) {
  const numeric = Number.isFinite(value) ? value : 0;
  const normalizedUnit = (unit ?? "").trim();

  if (!normalizedUnit) {
    return standardFormat(numeric);
  }

  if (normalizedUnit === "A") {
    return formatCurrentWithSIPrefix(numeric);
  }

  if (SI_SCALABLE_UNITS.has(normalizedUnit)) {
    return formatUnitWithSIPrefix(numeric, normalizedUnit);
  }

  const separator = options?.withSpace ? " " : "";
  return `${standardFormat(numeric)}${separator}${normalizedUnit}`;
}
