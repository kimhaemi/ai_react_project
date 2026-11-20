import type { Metadata } from "next";
import InputDemo from "@/screens/ui-demo/InputDemo";

export const metadata: Metadata = { title: "입력창" };

export default function Page() {
  return <InputDemo />;
}
