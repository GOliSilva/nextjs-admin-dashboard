import { PhaseInfoClient } from "./phase-info-client";
import { getFaseInfo, PhaseType } from "@/services/phase-data.services";

type PropsType = {
    phase: PhaseType;
    compact?: boolean;
}

export function PhaseInfo({ phase, compact }: PropsType) {
    const faseInfo = getFaseInfo(phase);

    const cards = [
        {
            label: "Ângulo de Corrente",
            value: `${faseInfo.angulo_corrente}°`,
            hideIndicator: true,
            iconName: "AngleCurrent" as const,
        },
        {
            label: "Ângulo de Tensão",
            value: `${faseInfo.angulo_tensao}°`,
            hideIndicator: true,
            iconName: "AngleVoltage" as const,
        },
        {
            label: "Defasagem",
            value: `${faseInfo.defasagem}°`,
            hideIndicator: true,
            iconName: "PhaseShift" as const,
        },
    ];

    return (
<PhaseInfoClient 
            cards={cards} 
            compact={compact}
            className="sm:grid-cols-3 xl:grid-cols-3"
        />
    );
}
