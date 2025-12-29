import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getEnergiaData } from "@/services/fase-a.services";
import { EnergyChart } from "./energy-chart";

type PropsType = {
    energyType?: string; // "ponta" | "nao_ponta"
    className?: string;
};

export async function FaseAEnergyChart({ energyType, className }: PropsType) {
    // Default to "ponta" if undefined
    const resolvedType = (energyType === "nao_ponta" ? "nao_ponta" : "ponta") as "ponta" | "nao_ponta";

    const { categories, anoAtual, anoAnterior } = getEnergiaData(resolvedType);

    return (
        <div
            className={cn(
                "rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
                className,
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                    Consumo de Energia ({resolvedType === "ponta" ? "Ponta" : "Não Ponta"})
                </h2>

                <PeriodPicker
                    items={["ponta", "nao_ponta"]}
                    defaultValue={resolvedType}
                    sectionKey="energy_type"
                />
            </div>

            <EnergyChart categories={categories} anoAtual={anoAtual} anoAnterior={anoAnterior} />
        </div>
    );
}
