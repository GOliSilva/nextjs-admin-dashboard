"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { FirebaseDataProvider } from "@/contexts/firebase-data-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <SidebarProvider>
        <FirebaseDataProvider>{children}</FirebaseDataProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
