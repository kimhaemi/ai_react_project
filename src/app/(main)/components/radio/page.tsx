import type { Metadata } from "next";
import RadioDemo from "@/components/view/ui-demo/RadioDemo";

export const metadata: Metadata = { title: "라디오" };

export default function Page() {
  return <RadioDemo />;
}
