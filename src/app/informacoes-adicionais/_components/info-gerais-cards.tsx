import { standardFormat } from "@/lib/format-number";
import { getInfoGeraisPotencias } from "@/services/info-gerais.services";
import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";

const formatPower = (value: number, unit: string) =>
  `${standardFormat(value)} ${unit}`;

type InfoGeraisCardsProps = {
  compact?: boolean;
};

export async function InfoGeraisCards({ compact }: InfoGeraisCardsProps) {
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

  const containerClassName = compact
    ? "flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5"
    : "grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5";
  const cardClassName = compact
    ? "min-w-[160px] shrink-0 sm:min-w-0"
    : undefined;
  const iconProps = compact
    ? { className: "size-10 sm:size-[58px]" }
    : undefined;

  return (
    <div className={containerClassName}>
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
          className={cardClassName}
          iconProps={iconProps}
          compact={compact}
        />
      ))}
    </div>
  );
}
