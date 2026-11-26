import type { Metadata } from "next";
import GridCompare from "@/components/view/ui-demo/GridCompare";

export const metadata: Metadata = { title: "그리드 기능 비교표" };

export default function Page() {
  return <GridCompare />;
}
