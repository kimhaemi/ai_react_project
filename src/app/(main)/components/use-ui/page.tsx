import type { Metadata } from "next";
import UseUIDemo from "@/components/view/ui-demo/UseUIDemo";

export const metadata: Metadata = { title: "useUI 훅" };

export default function Page() {
  return <UseUIDemo />;
}
