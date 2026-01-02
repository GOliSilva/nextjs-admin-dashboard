"use client";

import { ScrollableCards, type CardData } from "@/components/ScrollableCards";
import * as icons from "./icons";

type CardDataWithoutIcon = Omit<CardData, "Icon"> & {
  iconName: keyof typeof icons;
};

type Props = {
  cards: CardDataWithoutIcon[];
};

export function OverviewCardsClient({ cards }: Props) {
  const cardsWithIcons: CardData[] = cards.map((card) => ({
    ...card,
    Icon: icons[card.iconName],
  }));

  return <ScrollableCards cards={cardsWithIcons} />;
}
