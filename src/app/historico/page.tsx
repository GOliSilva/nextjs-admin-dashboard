import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { HistoricoView } from "./_components/historico-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historico",
};

const HistoricoPage = () => {
  return (
    <>
      <Breadcrumb pageName="Historico" />
      <HistoricoView />
    </>
  );
};

export default HistoricoPage;
