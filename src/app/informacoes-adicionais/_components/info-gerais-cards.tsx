import { standardFormat } from "@/lib/format-number";
import { getInfoGeraisPotencias } from "@/services/info-gerais.services";
import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";

const formatPower = (value: number, unit: string) =>
  `${standardFormat(value)} ${unit}`;

export async function InfoGeraisCards() {
  const potencias = await getInfoGeraisPotencias();

  const cards = [
    {
      label: "Pot\u00EAncia direta",
      value: formatPower(potencias.direta, "W"),
      Icon: icons.PowerDirect,
    },
    {
      label: "Pot\u00EAncia reversa",
      value: formatPower(potencias.reversa, "W"),
      Icon: icons.PowerReverse,
    },
    {
      label: "Pot\u00EAncia reativa",
      value: formatPower(potencias.reativa, "Var"),
      Icon: icons.PowerReactive,
    },
    {
      label: "Pot\u00EAncia complexa",
      value: formatPower(potencias.complexa, "Va"),
      Icon: icons.PowerComplex,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      {cards.map((card) => (
        <OverviewCard
          key={card.label}
          label={card.label}
          data={{
            value: card.value,
            growthRate: 0,
            hideIndicator: true,
          }}
          Icon={card.Icon}
        />
      ))}
    </div>
  );
}
