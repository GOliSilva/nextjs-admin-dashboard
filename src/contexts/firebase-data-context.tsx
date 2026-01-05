"use client";

import { getMostRecentData } from "@/lib/firebase";
import { createContext, useContext, useEffect, useState } from "react";

type FirebaseData = {
  fpc: number;
  angIc: number;
  angVc: number;
  Ia: number;
  Ph: number;
  S: number;
  angIb: number;
  angVa: number;
  fpt: number;
  createdAt: string;
  Va: number;
  Ea: number;
  fpb: number;
  In: number;
  Vc: number;
  Eb: number;
  angIa: number;
  Pb: number;
  Pdir: number;
  angVb: number;
  Ec: number;
  Vb: number;
  Prev: number;
  f: number;
  Ic: number;
  Pa: number;
  t: number;
  Q: number;
  Ib: number;
  Pc: number;
  fpa: number;
  id?: string;
} | null;

type FirebaseDataContextType = {
  data: FirebaseData;
  isLoading: boolean;
};

const FirebaseDataContext = createContext<FirebaseDataContextType | undefined>(
  undefined
);

export function FirebaseDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<FirebaseData>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 🔥 APENAS 1 onSnapshot para toda a aplicação
    const unsubscribe: () => void = getMostRecentData((latestData: FirebaseData) => {
      setData(latestData);
      setIsLoading(false);
    });

    // Cleanup quando o app desmontar
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseDataContext.Provider value={{ data, isLoading }}>
      {children}
    </FirebaseDataContext.Provider>
  );
}

// Hook customizado para usar em qualquer componente
export function useFirebaseData() {
  const context = useContext(FirebaseDataContext);
  if (context === undefined) {
    throw new Error("useFirebaseData must be used within FirebaseDataProvider");
  }
  return context;
}
