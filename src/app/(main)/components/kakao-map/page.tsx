import type { Metadata } from "next";
import KakaoMapDemo from "@/components/view/ui-demo/KakaoMapDemo";

export const metadata: Metadata = { title: "카카오맵" };

export default function Page() {
  return <KakaoMapDemo />;
}
