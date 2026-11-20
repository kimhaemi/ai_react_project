import type { Metadata } from "next";
import GridDemo from "@/components/view/ui-demo/GridDemo";

export const metadata: Metadata = { title: "그리드" };

export default function Page() {
  return <GridDemo />;
}
