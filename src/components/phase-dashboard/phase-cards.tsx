import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";
import { getCurrentValue, getPhaseData, PhaseType } from "@/services/phase-data.services";

type PropsType = {
    phase: PhaseType;
    phases?: PhaseType[];
    compact?: boolean;
}

export async function PhaseCards({ phase, phases, compact }: PropsType) {
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
    const containerClassName = compact
        ? "flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5"
        : "grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5";
    const cardClassName = compact
        ? "min-w-[160px] shrink-0 sm:min-w-0"
        : undefined;
    const iconProps = compact
        ? { className: "size-10 sm:size-[58px]" }
        : undefined;

    return (
        <div className={containerClassName}>
            <OverviewCard
                label="Corrente Média"
                data={{
                    value: `${formatValue(corrente)} A`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Current}
                className={cardClassName}
                iconProps={iconProps}
                compact={compact}
            />
            <OverviewCard
                label="Tensão Média"
                data={{
                    value: `${formatValue(tensao)} V`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Voltage}
                className={cardClassName}
                iconProps={iconProps}
                compact={compact}
            />
            <OverviewCard
                label="Potência Media"
                data={{
                    value: `${formatValue(potencia)} W`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Power}
                className={cardClassName}
                iconProps={iconProps}
                compact={compact}
            />
            <OverviewCard
                label="Fator de Potência Media"
                data={{
                    value: `${formatValue(fatorPotencia)}`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.PowerFactor}
                className={cardClassName}
                iconProps={iconProps}
                compact={compact}
            />
        </div>
    );
}
