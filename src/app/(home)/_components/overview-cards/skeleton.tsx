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
  const titleClassName = compact ? "h-6 w-28 sm:h-7" : "h-7 w-30";
  const labelClassName = compact ? "h-4 w-22 sm:h-5" : "h-5 w-24";
  const rowLabelClassName = compact ? "h-3 w-4 sm:h-4" : "h-4 w-5";
  const rowValueClassName = compact ? "h-3 w-16 sm:h-4 sm:w-22" : "h-4 w-24";

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
              "flex flex-col",
              compact ? "mt-4" : "mt-6",
            )}
          >
            {i === 0 ? (
              <div>
                <Skeleton className={cn("mb-1.5", titleClassName)} />
                <Skeleton className={labelClassName} />
              </div>
            ) : (
              <div className="w-full">
                <Skeleton className={cn("mb-2", titleClassName)} />
                <div className="space-y-1.5">
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center justify-between gap-3"
                    >
                      <Skeleton className={rowLabelClassName} />
                      <Skeleton className={rowValueClassName} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
