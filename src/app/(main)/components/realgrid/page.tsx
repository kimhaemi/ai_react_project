import type { Metadata } from "next";
import RealGridDemoLoader from "@/components/view/ui-demo/RealGridDemoLoader";

export const metadata: Metadata = { title: "RealGrid2" };

export default function Page() {
  return <RealGridDemoLoader />;
}
