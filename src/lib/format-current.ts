const MINOR_PREFIX_THRESHOLD = 1;
const BASE_PREFIX_THRESHOLD = 1_000;
const KILO_PREFIX_THRESHOLD = 1_000_000;

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

export function formatCurrentWithSIPrefix(value: number): string {
  if (!Number.isFinite(value)) {
    return "0A";
  }

  if (value === 0) {
    return "0A";
  }

  const absoluteValue = Math.abs(value);
  let scaled = value;
  let suffix = "A";

  if (absoluteValue < MINOR_PREFIX_THRESHOLD) {
    scaled = value * 1_000;
    suffix = "mA";
  } else if (absoluteValue < BASE_PREFIX_THRESHOLD) {
    scaled = value;
    suffix = "A";
  } else if (absoluteValue < KILO_PREFIX_THRESHOLD) {
    scaled = value / 1_000;
    suffix = "kA";
  } else {
    scaled = value / 1_000_000;
    suffix = "MA";
  }

  let rounded = roundToTwoDecimals(scaled);

  // Promote unit when rounding reaches 1000 (e.g. 999.995A -> 1kA).
  if (Math.abs(rounded) >= 1_000) {
    if (suffix === "mA") {
      rounded = roundToTwoDecimals(value);
      suffix = "A";
    } else if (suffix === "A") {
      rounded = roundToTwoDecimals(value / 1_000);
      suffix = "kA";
    } else if (suffix === "kA") {
      rounded = roundToTwoDecimals(value / 1_000_000);
      suffix = "MA";
    }
  }

  return `${stripTrailingZeros(rounded)}${suffix}`;
}
