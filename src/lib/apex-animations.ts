import type { ApexOptions } from "apexcharts";

export const apexSeriesAnimationPreset: NonNullable<
  NonNullable<ApexOptions["chart"]>["animations"]
> = {
  enabled: true,
  speed: 1,
  animateGradually: {
    enabled: false,
    delay: 0,
  },
  dynamicAnimation: {
    enabled: true,
    speed: 350,
  },
};
