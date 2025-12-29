import { PhaseDashboard } from "@/app/_components/phase-dashboard";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default function FaseAPage(props: PropsType) {
  return <PhaseDashboard {...props} phaseKey="fase_a" />;
}
