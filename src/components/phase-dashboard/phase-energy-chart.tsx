import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getEnergiaData, PhaseType } from "@/services/phase-data.services";
import { EnergyChart } from "@/app/fase-a/_components/energy-chart"; // Reuse the presentation component

type PropsType = {
    phase: PhaseType;
    phases?: PhaseType[];
    energyType?: string; // "ponta" | "nao_ponta"
    className?: string;
    compact?: boolean;
};

export async function PhaseEnergyChart({ phase, phases, energyType, className, compact }: PropsType) {
    // Default to "ponta" if undefined
    const resolvedType = (energyType === "nao_ponta" ? "nao_ponta" : "ponta") as "ponta" | "nao_ponta";

    const phasesToUse = phases && phases.length > 0 ? phases : [phase];
    const energiaPorFase = phasesToUse.map((phaseKey) => getEnergiaData(phaseKey, resolvedType));
    const { categories } = energiaPorFase[0];

    const sumSeries = (seriesKey: "anoAtual" | "anoAnterior") =>
        energiaPorFase[0][seriesKey].map((_, index) =>
            energiaPorFase.reduce((total, faseData) => total + faseData[seriesKey][index], 0)
        );

    const anoAtual = sumSeries("anoAtual");
    const anoAnterior = sumSeries("anoAnterior");
    const containerClassName = cn(
        "rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card",
        compact ? "p-4 sm:px-7.5 sm:pb-6 sm:pt-7.5" : "px-7.5 pt-7.5",
        className,
    );
    const headerClassName = compact
        ? "flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
        : "flex flex-wrap items-center justify-between gap-4";
    const titleClassName = cn(
        "font-bold text-dark dark:text-white",
        compact ? "text-lg sm:text-body-2xlg" : "text-body-2xlg",
    );

    return (
        <div className={containerClassName}>
            <div className={headerClassName}>
                <h2 className={titleClassName}>
                    Consumo de Energia ({resolvedType === "ponta" ? "Ponta" : "Não Ponta"})
                </h2>

                <div className={compact ? "w-full sm:w-auto" : undefined}>
                    <PeriodPicker
                        items={["ponta", "nao_ponta"]}
                        defaultValue={resolvedType}
                        sectionKey="energy_type"
                    />
                </div>
            </div>

            <EnergyChart categories={categories} anoAtual={anoAtual} anoAnterior={anoAnterior} />
        </div>
    );
}
