"use client";

import { ScrollableCards, type CardData } from "@/components/ScrollableCards";
import * as icons from "@/app/(home)/_components/overview-cards/icons";

type CardDataWithoutIcon = Omit<CardData, "Icon"> & {
  iconName: keyof typeof icons;
};

type Props = {
  cards: CardDataWithoutIcon[];
  compact?: boolean;
};

export function PhaseCardsClient({ cards, compact }: Props) {
  const cardsWithIcons: CardData[] = cards.map((card) => ({
    ...card,
    Icon: icons[card.iconName],
  }));

  return <ScrollableCards cards={cardsWithIcons} compact={compact} />;
}
