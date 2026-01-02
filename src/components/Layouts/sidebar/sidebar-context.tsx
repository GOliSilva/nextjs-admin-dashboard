"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type SidebarState = "expanded" | "collapsed";

type SidebarContextType = {
  state: SidebarState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean | undefined;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const isMobile = useIsMobile();
  // Don't set initial open state until we know if it's mobile
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    // Start closed on initial render to prevent flash
    return false;
  });
  const bodyOverflow = useRef<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set correct initial state once we know if it's mobile
    if (isMobile !== undefined && !isInitialized) {
      setIsOpen(isMobile ? false : defaultOpen);
      setIsInitialized(true);
    }
  }, [isMobile, defaultOpen, isInitialized]);

  useEffect(() => {
    // Only update on subsequent changes after initialization
    if (!isInitialized) return;
    
    if (isMobile === true) {
      setIsOpen(false);
    } else if (isMobile === false) {
      setIsOpen(true);
    }
  }, [isMobile, isInitialized]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (bodyOverflow.current === null) {
      bodyOverflow.current = document.body.style.overflow;
    }

    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else if (bodyOverflow.current !== null) {
      document.body.style.overflow = bodyOverflow.current;
    }

    return () => {
      if (bodyOverflow.current !== null) {
        document.body.style.overflow = bodyOverflow.current;
      }
    };
  }, [isMobile, isOpen]);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  return (
    <SidebarContext.Provider
      value={{
        state: isOpen ? "expanded" : "collapsed",
        isOpen,
        setIsOpen,
        isMobile,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
