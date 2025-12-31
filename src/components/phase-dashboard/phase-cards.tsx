import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";
import { getCurrentValue, getPhaseData, PhaseType } from "@/services/phase-data.services";

type PropsType = {
    phase: PhaseType;
    phases?: PhaseType[];
}

export async function PhaseCards({ phase, phases }: PropsType) {
    const phasesToUse = phases && phases.length > 0 ? phases : [phase];
    await Promise.all(phasesToUse.map((phaseKey) => getPhaseData(phaseKey)));

    const averageMetric = (metric: Parameters<typeof getCurrentValue>[1]) => {
        const values = phasesToUse.map((phaseKey) => getCurrentValue(phaseKey, metric));
        const sum = values.reduce((total, value) => total + value, 0);
        return values.length > 0 ? sum / values.length : 0;
    };

    const formatValue = (value: number) => (
        Number.isInteger(value) ? value.toString() : value.toFixed(2)
    );

    const corrente = averageMetric("corrente");
    const tensao = averageMetric("tensao");
    const potencia = averageMetric("potencia");
    const fatorPotencia = averageMetric("fator_potencia");

    return (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <OverviewCard
                label="Corrente Média"
                data={{
                    value: `${formatValue(corrente)} A`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Views}
            />
            <OverviewCard
                label="Tensão Média"
                data={{
                    value: `${formatValue(tensao)} V`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Profit}
            />
            <OverviewCard
                label="Potência Media"
                data={{
                    value: `${formatValue(potencia)} W`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Product}
            />
            <OverviewCard
                label="Fator de Potência Media"
                data={{
                    value: `${formatValue(fatorPotencia)}`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Users}
            />
        </div>
    );
}
