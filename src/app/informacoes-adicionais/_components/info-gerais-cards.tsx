import { standardFormat } from "@/lib/format-number";
import { getInfoGeraisPotencias } from "@/services/info-gerais.services";
import { InfoGeraisCardsClient } from "./info-gerais-cards-client";

const formatPower = (value: number, unit: string) =>
  `${standardFormat(value)} ${unit}`;

type InfoGeraisCardsProps = {
  compact?: boolean;
};

export async function InfoGeraisCards({ compact }: InfoGeraisCardsProps) {
  const potencias = await getInfoGeraisPotencias();

  const cards = [
    {
      label: "Potência direta",
      value: formatPower(potencias.direta, "W"),
      hideIndicator: true,
      iconName: "PowerDirect" as const,
    },
    {
      label: "Potência reversa",
      value: formatPower(potencias.reversa, "W"),
      hideIndicator: true,
      iconName: "PowerReverse" as const,
    },
    {
      label: "Potência reativa",
      value: formatPower(potencias.reativa, "Var"),
      hideIndicator: true,
      iconName: "PowerReactive" as const,
    },
    {
      label: "Potência complexa",
      value: formatPower(potencias.complexa, "Va"),
      hideIndicator: true,
      iconName: "PowerComplex" as const,
    },
  ];

  return <InfoGeraisCardsClient cards={cards} compact={compact} />;
}
