import type { Metadata } from "next";
import ChartDemo from "./ChartDemo";

export const metadata: Metadata = { title: "차트" };

export default function Page() {
  return <ChartDemo />;
}
