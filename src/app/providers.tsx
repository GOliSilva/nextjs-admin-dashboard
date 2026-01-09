"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { PwaRegister } from "@/components/pwa-register";
import { FirebaseDataProvider } from "@/contexts/firebase-data-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <PwaRegister />
      <SidebarProvider>
        <FirebaseDataProvider>{children}</FirebaseDataProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
