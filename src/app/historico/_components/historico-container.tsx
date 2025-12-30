"use client";

type Props = {
  children: React.ReactNode;
};

export function HistoricoContainer({ children }: Props) {
  return (
    <section className="space-y-6 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-6">
      {children}
    </section>
  );
}
