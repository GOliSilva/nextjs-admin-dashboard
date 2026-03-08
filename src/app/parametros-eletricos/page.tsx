import type { Metadata } from "next";
import { ParametrosEletricosView } from "./_components/parametros-eletricos-view";

export const metadata: Metadata = {
  title: "Parâmetros Elétricos",
};

export default function ParametrosEletricosPage() {
  return <ParametrosEletricosView />;
}
