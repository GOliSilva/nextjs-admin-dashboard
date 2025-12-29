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
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isDecreasing =
    data.indicatorIsDecreasing ?? data.growthRate < 0;
  const indicatorValue = data.indicatorValue ?? `${data.growthRate}%`;

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
      <Icon />

      <div className="mt-6 flex items-end justify-between">
        <dl>
          <dt
            className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white"
            style={data.valueStyle}
          >
            {data.value}
          </dt>

          <dd className="text-sm font-medium text-dark-6">{label}</dd>
        </dl>

        {!data.hideIndicator && (
          <dl
            className={cn(
              "text-sm font-medium",
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
