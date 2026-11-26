import type { Metadata } from "next";
import { MuiGridDemo } from "@/components/view/ui-demo/GridDemoLoaders";

export const metadata: Metadata = { title: "MUI X DataGrid" };

export default function Page() {
  return <MuiGridDemo />;
}
