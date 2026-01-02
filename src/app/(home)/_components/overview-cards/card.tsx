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
  const isDecreasing =
    data.indicatorIsDecreasing ?? data.growthRate < 0;
  const indicatorValue = data.indicatorValue ?? `${data.growthRate}%`;

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white shadow-1 dark:bg-gray-dark",
        compact ? "p-4" : "p-6",
        className,
      )}
    >
      <Icon {...iconProps} />

      <div
        className={cn(
          "flex items-end justify-between",
          compact ? "mt-4" : "mt-6",
        )}
      >
        <dl>
          <dt
            className={cn(
              "mb-1.5 font-bold text-dark dark:text-white",
              compact ? "text-lg" : "text-heading-6",
            )}
            style={data.valueStyle}
          >
            {data.value}
          </dt>

          <dd
            className={cn(
              "font-medium text-dark-6",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {label}
          </dd>
        </dl>

        {!data.hideIndicator && (
          <dl
            className={cn(
              "font-medium",
              compact ? "text-xs" : "text-sm",
              isDecreasing ? "text-red" : "text-green",
            )}
            style={data.indicatorStyle}
          >
            <dt className="flex items-center gap-1.5">
              {indicatorValue}
              {isDecreasing ? (
                <ArrowDownIcon aria-hidden />
              ) : (
                <ArrowUpIcon aria-hidden />
              )}
            </dt>

            <dd className="sr-only">
              {label} {isDecreasing ? "Decreased" : "Increased"} by{" "}
              {indicatorValue}
            </dd>
          </dl>
        )}
      </div>
    </div>
  );
}
