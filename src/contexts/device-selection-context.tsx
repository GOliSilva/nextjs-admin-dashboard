"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const TEMP_DEVICE_OPTIONS = ["MedidorGalpao", "device-unknown"] as const;

const STORAGE_KEY = "selectedDeviceId";

type DeviceId = (typeof TEMP_DEVICE_OPTIONS)[number];

type DeviceSelectionContextType = {
  selectedDeviceId: DeviceId;
  setSelectedDeviceId: (deviceId: DeviceId) => void;
  deviceOptions: readonly DeviceId[];
};

const DeviceSelectionContext = createContext<DeviceSelectionContextType | undefined>(
  undefined,
);

function resolveInitialDevice(): DeviceId {
  const envDevice = (process.env.NEXT_PUBLIC_DEVICE_ID ?? "").trim();
  if (envDevice === "MedidorGalpao" || envDevice === "device-unknown") {
    return envDevice;
  }
  return "MedidorGalpao";
}

export function DeviceSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedDeviceId, setSelectedDeviceIdState] =
    useState<DeviceId>(resolveInitialDevice);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "MedidorGalpao" || stored === "device-unknown") {
      setSelectedDeviceIdState(stored);
    }
  }, []);

  const setSelectedDeviceId = (deviceId: DeviceId) => {
    setSelectedDeviceIdState(deviceId);
    window.localStorage.setItem(STORAGE_KEY, deviceId);
  };

  const value = useMemo(
    () => ({
      selectedDeviceId,
      setSelectedDeviceId,
      deviceOptions: TEMP_DEVICE_OPTIONS,
    }),
    [selectedDeviceId],
  );

  return <DeviceSelectionContext.Provider value={value}>{children}</DeviceSelectionContext.Provider>;
}

export function useDeviceSelection() {
  const context = useContext(DeviceSelectionContext);
  if (!context) {
    throw new Error("useDeviceSelection must be used within DeviceSelectionProvider");
  }
  return context;
}

