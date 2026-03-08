import type { Metadata } from "next";
import { FasoresView } from "./_components/fasores-view";

export const metadata: Metadata = {
  title: "Fasores",
};

export default function FasoresPage() {
  return <FasoresView />;
}
