import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type OverviewCardsSkeletonProps = {
  compact?: boolean;
};

export function OverviewCardsSkeleton({
  compact,
}: OverviewCardsSkeletonProps) {
  const containerClassName = compact
    ? "flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5"
    : "grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5";
  const cardClassName = compact
    ? "min-w-[160px] shrink-0 sm:min-w-0"
    : undefined;
  const iconClassName = compact ? "size-10 sm:size-12" : "size-12";
  const titleClassName = compact ? "h-6 w-16 sm:h-7" : "h-7 w-18";
  const labelClassName = compact ? "h-4 w-18 sm:h-5" : "h-5 w-20";
  const indicatorClassName = compact ? "h-4 w-12 sm:h-5" : "h-5 w-15";

  return (
    <div className={containerClassName}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark",
            compact && "p-4",
            cardClassName,
          )}
        >
          <Skeleton className={cn(iconClassName, "rounded-full")} />

          <div
            className={cn(
              "flex items-end justify-between",
              compact ? "mt-4" : "mt-6",
            )}
          >
            <div>
              <Skeleton className={cn("mb-1.5", titleClassName)} />

              <Skeleton className={labelClassName} />
            </div>

            <Skeleton className={indicatorClassName} />
          </div>
        </div>
      ))}
    </div>
  );
}
