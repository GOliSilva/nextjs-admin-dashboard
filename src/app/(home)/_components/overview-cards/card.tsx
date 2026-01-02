import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { CSSProperties, JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
    valueStyle?: CSSProperties;
    indicatorValue?: string;
    indicatorIsDecreasing?: boolean;
    indicatorStyle?: CSSProperties;
    hideIndicator?: boolean;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  className?: string;
  iconProps?: SVGProps<SVGSVGElement>;
  compact?: boolean;
};

export function OverviewCard({
  label,
  data,
  Icon,
  className,
  iconProps,
  compact,
}: PropsType) {
  const isDecreasing = data.indicatorIsDecreasing ?? data.growthRate < 0;
  const indicatorValue = data.indicatorValue ?? `${data.growthRate}%`;

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white shadow-1 dark:bg-gray-dark",
        "box-border w-full h-full flex flex-col",
        compact ? "p-3" : "p-6",
        className,
      )}
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
              "font-bold text-dark dark:text-white leading-tight whitespace-nowrap",
              compact ? "text-base" : "text-heading-6",
            )}
            style={data.valueStyle}
          >
            {data.value}
          </p>
          <p
            className={cn(
              "font-medium text-dark-6 mt-1 whitespace-nowrap",
              compact ? "text-[11px]" : "text-sm",
            )}
          >
            {label}
          </p>
        </div>

        {/* Right side: Indicator */}
        {!data.hideIndicator && (
          <div
            className={cn(
              "flex items-center gap-1 font-medium",
              compact ? "text-[11px]" : "text-sm",
              isDecreasing ? "text-red" : "text-green",
            )}
            style={data.indicatorStyle}
          >
            <span>{indicatorValue}</span>
            {isDecreasing ? (
              <ArrowDownIcon aria-hidden className="w-3 h-3 flex-shrink-0" />
            ) : (
              <ArrowUpIcon aria-hidden className="w-3 h-3 flex-shrink-0" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
