import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  className?: string;
  showGrowth?: boolean;
};

export function OverviewCard({
  label,
  data,
  Icon,
  className,
  showGrowth = true,
}: PropsType) {
  const isDecreasing = data.growthRate < 0;

  return (
    <div className={cn("dash-card rounded-[10px] p-6", className)}>
      <Icon />

      <div className="mt-6 flex items-end justify-between">
        <dl>
          <dt className="mb-1.5 text-heading-6 font-bold">{data.value}</dt>

          <dd className="dash-muted text-sm font-medium">{label}</dd>
        </dl>

        {showGrowth && (
          <dl
            className={cn(
              "text-sm font-medium",
              isDecreasing ? "text-red" : "text-green",
            )}
          >
            <dt className="flex items-center gap-1.5">
              {data.growthRate}%
              {isDecreasing ? (
                <ArrowDownIcon aria-hidden />
              ) : (
                <ArrowUpIcon aria-hidden />
              )}
            </dt>

            <dd className="sr-only">
              {label} {isDecreasing ? "Decreased" : "Increased"} by{" "}
              {data.growthRate}%
            </dd>
          </dl>
        )}
      </div>
    </div>
  );
}
