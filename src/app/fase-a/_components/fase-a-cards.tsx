import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";
import { getCurrentValue, getFaseAData } from "@/services/fase-a.services";

export async function FaseACards() {
    await getFaseAData(); // Prefetch to ensure data is "available" or just to simulate loading if needed (the service fakes delay)

    const corrente = getCurrentValue("corrente");
    const tensao = getCurrentValue("tensao");
    const potencia = getCurrentValue("potencia");
    const fatorPotencia = getCurrentValue("fator_potencia");

    return (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <OverviewCard
                label="Corrente Atual"
                data={{
                    value: `${corrente} A`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Current}
            />
            <OverviewCard
                label="Tensão Atual"
                data={{
                    value: `${tensao} V`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Voltage}
            />
            <OverviewCard
                label="Potência Atual"
                data={{
                    value: `${potencia} W`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.Power}
            />
            <OverviewCard
                label="Fator de Potência"
                data={{
                    value: `${fatorPotencia}`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.PowerFactor}
            />
        </div>
    );
}
