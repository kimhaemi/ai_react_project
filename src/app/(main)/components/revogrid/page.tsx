import type { Metadata } from "next";
import { RevoGridDemo } from "@/components/view/ui-demo/GridDemoLoaders";

export const metadata: Metadata = { title: "RevoGrid" };

export default function Page() {
  return <RevoGridDemo />;
}
