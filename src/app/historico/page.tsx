import { HistoricoView } from "./_components/historico-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historico",
};

const HistoricoPage = () => {
  return (
    <>
      <HistoricoView />
    </>
  );
};

export default HistoricoPage;
