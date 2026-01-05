"use client";

import { useFirebaseData } from "@/contexts/firebase-data-context";
import { standardFormat } from "@/lib/format-number";
import { InfoGeraisCardsClient } from "./info-gerais-cards-client";

const toNumber = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

const formatPower = (value: number | null, unit: string) =>
  value === null ? `-- ${unit}` : `${standardFormat(value)} ${unit}`;

type InfoGeraisCardsProps = {
  compact?: boolean;
};

export function InfoGeraisCards({ compact }: InfoGeraisCardsProps) {
  const { data } = useFirebaseData();

  const cards = [
    {
      label: "PotA¦ncia direta",
      value: formatPower(toNumber(data?.Pdir), "W"),
      hideIndicator: true,
      iconName: "PowerDirect" as const,
    },
    {
      label: "PotA¦ncia reversa",
      value: formatPower(toNumber(data?.Prev), "W"),
      hideIndicator: true,
      iconName: "PowerReverse" as const,
    },
    {
      label: "PotA¦ncia reativa",
      value: formatPower(toNumber(data?.Q), "Var"),
      hideIndicator: true,
      iconName: "PowerReactive" as const,
    },
    {
      label: "PotA¦ncia complexa",
      value: formatPower(toNumber(data?.S), "Va"),
      hideIndicator: true,
      iconName: "PowerComplex" as const,
    },
  ];

  return <InfoGeraisCardsClient cards={cards} compact={compact} />;
}
