import type { Metadata } from "next";
import { TabulatorDemo } from "@/components/view/ui-demo/GridDemoLoaders";

export const metadata: Metadata = { title: "Tabulator" };

export default function Page() {
  return <TabulatorDemo />;
}
