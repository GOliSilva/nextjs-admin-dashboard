"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CSSProperties, JSX, SVGProps } from "react";

export type CardData = {
  label: string;
  value: number | string;
  growthRate?: number;
  valueStyle?: CSSProperties;
  indicatorValue?: string;
  indicatorIsDecreasing?: boolean;
  indicatorStyle?: CSSProperties;
  hideIndicator?: boolean;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  iconProps?: SVGProps<SVGSVGElement>;
};

type ScrollableCardsProps = {
  cards: CardData[];
  compact?: boolean;
  cardWidth?: string;
  className?: string;
};

export function ScrollableCards({
  cards,
  compact = true,
  cardWidth = "140px",
  className,
}: ScrollableCardsProps) {
  const isMobile = useIsMobile();
  
  // Mobile: compact mode with scroll
  // Desktop: original design (always full size)
  const shouldUseCompactMode = isMobile && compact;
  const iconProps = shouldUseCompactMode
    ? { className: "size-8" }
    : undefined;

  if (shouldUseCompactMode) {
    // Mobile: Horizontal scroll with fixed-width cards
    return (
      <div className="w-full overflow-hidden">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {cards.map((card, index) => (
            <Card
              key={index}
              label={card.label}
              value={card.value}
              growthRate={card.growthRate ?? 0}
              valueStyle={card.valueStyle}
              indicatorValue={card.indicatorValue}
              indicatorIsDecreasing={card.indicatorIsDecreasing}
              indicatorStyle={card.indicatorStyle}
              hideIndicator={card.hideIndicator}
              Icon={card.Icon}
              iconProps={card.iconProps ?? iconProps}
              compact={true}
              className="flex-shrink-0 h-full"
              style={{ width: cardWidth }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Original grid layout (full size cards)
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5",
        className,
      )}
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          label={card.label}
          value={card.value}
          growthRate={card.growthRate ?? 0}
          valueStyle={card.valueStyle}
          indicatorValue={card.indicatorValue}
          indicatorIsDecreasing={card.indicatorIsDecreasing}
          indicatorStyle={card.indicatorStyle}
          hideIndicator={card.hideIndicator}
          Icon={card.Icon}
          iconProps={card.iconProps ?? iconProps}
          compact={false}
        />
      ))}
    </div>
  );
}

// Card component (internal to ScrollableCards)
type CardProps = {
  label: string;
  value: number | string;
  growthRate: number;
  valueStyle?: CSSProperties;
  indicatorValue?: string;
  indicatorIsDecreasing?: boolean;
  indicatorStyle?: CSSProperties;
  hideIndicator?: boolean;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  iconProps?: SVGProps<SVGSVGElement>;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

function Card({
  label,
  value,
  growthRate,
  valueStyle,
  indicatorValue,
  indicatorIsDecreasing,
  indicatorStyle,
  hideIndicator,
  Icon,
  iconProps,
  compact,
  className,
  style,
}: CardProps) {
  const isDecreasing = indicatorIsDecreasing ?? growthRate < 0;
  const indicator = indicatorValue ?? `${growthRate}%`;

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white shadow-1 dark:bg-gray-dark",
        "box-border w-full h-full flex flex-col",
        compact ? "p-3" : "p-6",
        className,
      )}
      style={style}
    >
      <Icon {...iconProps} />

      <div
        className={cn(
          "flex items-end justify-between flex-1",
          compact ? "mt-3" : "mt-6",
        )}
      >
        {/* Left side: Value and Label */}
        <div className="flex-1 min-w-0 pr-2">
          <p
            className={cn(
              "font-bold text-dark dark:text-white leading-tight",
              compact ? "text-base whitespace-nowrap" : "text-heading-6 mb-1.5",
            )}
            style={valueStyle}
          >
            {value}
          </p>
          <p
            className={cn(
              "font-medium text-dark-6",
              compact ? "text-[11px] mt-1 whitespace-nowrap" : "text-sm",
            )}
          >
            {label}
          </p>
        </div>

        {/* Right side: Indicator */}
        {!hideIndicator && (
          <div
            className={cn(
              "flex items-center gap-1.5 font-medium text-sm",
              isDecreasing ? "text-red" : "text-green",
            )}
            style={indicatorStyle}
          >
            <span>{indicator}</span>
            {isDecreasing ? (
              <ArrowDownIcon className="w-3 h-3 flex-shrink-0" />
            ) : (
              <ArrowUpIcon className="w-3 h-3 flex-shrink-0" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Arrow icons (can be replaced with your own)
function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2L6 10M6 2L10 6M6 2L2 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 10L6 2M6 10L2 6M6 10L10 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
