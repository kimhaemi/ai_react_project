import type { Metadata } from "next";
import CheckboxDemo from "@/screens/ui-demo/CheckboxDemo";

export const metadata: Metadata = { title: "체크박스" };

export default function Page() {
  return <CheckboxDemo />;
}
