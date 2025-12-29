import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";
import { getCurrentValue, getPhaseData, PhaseType } from "@/services/phase-data.services";

type PropsType = {
    phase: PhaseType;
}

export async function PhaseCards({ phase }: PropsType) {
    await getPhaseData(phase);

    const corrente = getCurrentValue(phase, "corrente");
    const tensao = getCurrentValue(phase, "tensao");
    const potencia = getCurrentValue(phase, "potencia");
    const fatorPotencia = getCurrentValue(phase, "fator_potencia");

    return (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <OverviewCard
                label="Corrente Atual"
                data={{
                    value: `${corrente} A`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Views}
            />
            <OverviewCard
                label="Tensão Atual"
                data={{
                    value: `${tensao} V`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Profit}
            />
            <OverviewCard
                label="Potência Atual"
                data={{
                    value: `${potencia} W`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Product}
            />
            <OverviewCard
                label="Fator de Potência"
                data={{
                    value: `${fatorPotencia}`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Users}
            />
        </div>
    );
}
