import { PhaseDashboard } from "@/app/_components/phase-dashboard";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default function FaseBPage(props: PropsType) {
  return <PhaseDashboard {...props} phaseKey="fase_b" />;
}
