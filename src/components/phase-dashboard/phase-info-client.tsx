"use client";

import { ScrollableCards, type CardData } from "@/components/ScrollableCards";
import * as icons from "@/app/(home)/_components/overview-cards/icons";

type CardDataWithoutIcon = Omit<CardData, "Icon"> & {
  iconName: keyof typeof icons;
};

type Props = {
  cards: CardDataWithoutIcon[];
  compact?: boolean;
  className?: string;
};

export function PhaseInfoClient({ cards, compact, className }: Props) {
  const cardsWithIcons: CardData[] = cards.map((card) => ({
    ...card,
    Icon: icons[card.iconName],
  }));

  return <ScrollableCards cards={cardsWithIcons} compact={compact} className={className} />;
}
