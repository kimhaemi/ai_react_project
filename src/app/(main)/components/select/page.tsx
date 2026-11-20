import type { Metadata } from "next";
import SelectDemo from "@/components/view/ui-demo/SelectDemo";

export const metadata: Metadata = { title: "셀렉트 박스" };

export default function Page() {
  return <SelectDemo />;
}
