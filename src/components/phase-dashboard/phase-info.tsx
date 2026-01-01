import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";
import { getFaseInfo, PhaseType } from "@/services/phase-data.services";

type PropsType = {
    phase: PhaseType;
}

export function PhaseInfo({ phase }: PropsType) {
    const faseInfo = getFaseInfo(phase);

    return (
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 2xl:gap-7.5">
            <OverviewCard
                label="Ângulo de Corrente"
                data={{
                    value: `${faseInfo.angulo_corrente}°`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.AngleCurrent}
            />
            <OverviewCard
                label="Ângulo de Tensão"
                data={{
                    value: `${faseInfo.angulo_tensao}°`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.AngleVoltage}
            />
            <OverviewCard
                label="Defasagem"
                data={{
                    value: `${faseInfo.defasagem}°`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.PhaseShift}
            />
        </div>
    );
}
