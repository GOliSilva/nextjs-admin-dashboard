import { OverviewCard } from "@/app/(home)/_components/overview-cards/card";
import * as icons from "@/app/(home)/_components/overview-cards/icons";
import { getFaseInfo, PhaseType } from "@/services/phase-data.services";

type PropsType = {
    phase: PhaseType;
    compact?: boolean;
}

export function PhaseInfo({ phase, compact }: PropsType) {
    const faseInfo = getFaseInfo(phase);
    const containerClassName = compact
        ? "flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-6 2xl:gap-7.5"
        : "grid gap-4 sm:grid-cols-3 sm:gap-6 2xl:gap-7.5";
    const cardClassName = compact
        ? "min-w-[160px] shrink-0 sm:min-w-0"
        : undefined;
    const iconProps = compact
        ? { className: "size-10 sm:size-[58px]" }
        : undefined;

    return (
        <div className={containerClassName}>
            <OverviewCard
                label="Ângulo de Corrente"
                data={{
                    value: `${faseInfo.angulo_corrente}°`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.AngleCurrent}
                className={cardClassName}
                iconProps={iconProps}
                compact={compact}
            />
            <OverviewCard
                label="Ângulo de Tensão"
                data={{
                    value: `${faseInfo.angulo_tensao}°`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.AngleVoltage}
                className={cardClassName}
                iconProps={iconProps}
                compact={compact}
            />
            <OverviewCard
                label="Defasagem"
                data={{
                    value: `${faseInfo.defasagem}°`,
                    growthRate: 0,
                    hideIndicator: true,
                }}
                Icon={icons.PhaseShift}
                className={cardClassName}
                iconProps={iconProps}
                compact={compact}
            />
        </div>
    );
}
