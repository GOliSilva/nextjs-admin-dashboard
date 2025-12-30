import { AlarmsTable } from "@/components/Tables/alarms-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alarmes",
};

const AlarmsPage = () => {
  return (
    <>
      <AlarmsTable />
    </>
  );
};

export default AlarmsPage;
