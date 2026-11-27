import type { Metadata } from "next";
import { NaverMapDemo } from "@/components/view/ui-demo/MapDemo";

export const metadata: Metadata = { title: "네이버 지도" };

export default function Page() {
  return <NaverMapDemo />;
}
