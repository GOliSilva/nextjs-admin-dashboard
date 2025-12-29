import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { AlarmsTable } from "@/components/Tables/alarms-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alarmes",
};

const AlarmsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Alarmes" />
      <AlarmsTable />
    </>
  );
};

export default AlarmsPage;
