import type { Metadata } from "next";
import { TanStackTableDemo } from "@/components/view/ui-demo/GridDemoLoaders";

export const metadata: Metadata = { title: "TanStack Table" };

export default function Page() {
  return <TanStackTableDemo />;
}
