import type { Metadata } from "next";
import { GoogleMapDemo } from "@/components/view/ui-demo/MapDemo";

export const metadata: Metadata = { title: "Google 지도" };

export default function Page() {
  return <GoogleMapDemo />;
}
