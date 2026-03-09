"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { DailyAggErrorBanner } from "@/components/dev/daily-agg-error-banner";
import { PwaRegister } from "@/components/pwa-register";
import { DeviceSelectionProvider } from "@/contexts/device-selection-context";
import { FirebaseDataProvider } from "@/contexts/firebase-data-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <PwaRegister />
      <SidebarProvider>
        <DeviceSelectionProvider>
          <FirebaseDataProvider>
            <DailyAggErrorBanner />
            {children}
          </FirebaseDataProvider>
        </DeviceSelectionProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
