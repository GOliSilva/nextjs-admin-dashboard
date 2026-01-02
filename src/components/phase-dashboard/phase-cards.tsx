import { PhaseCardsClient } from "./phase-cards-client";
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

    const cards = [
        {
            label: "Corrente Média",
            value: `${formatValue(corrente)} A`,
            hideIndicator: true,
            iconName: "Current" as const,
        },
        {
            label: "Tensão Média",
            value: `${formatValue(tensao)} V`,
            hideIndicator: true,
            iconName: "Voltage" as const,
        },
        {
            label: "Potência Media",
            value: `${formatValue(potencia)} W`,
            hideIndicator: true,
            iconName: "Power" as const,
        },
        {
            label: "Fator de Potência Media",
            value: `${formatValue(fatorPotencia)}`,
            hideIndicator: true,
            iconName: "PowerFactor" as const,
        },
    ];

    return <PhaseCardsClient cards={cards} compact={compact} />;
}
