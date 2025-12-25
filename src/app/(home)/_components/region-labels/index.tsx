"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./map"), { ssr: false });

export function RegionLabels() {
  return (
    <div className="dash-panel col-span-12 rounded-[10px] p-7.5 xl:col-span-7">
      <h2 className="mb-7 text-body-2xlg font-bold">Region labels</h2>

      <Map />
    </div>
  );
}
