import type { Metadata } from "next";
import MapCompare from "@/components/view/ui-demo/MapCompare";

export const metadata: Metadata = { title: "지도 비교" };

export default function Page() {
  return <MapCompare />;
}
