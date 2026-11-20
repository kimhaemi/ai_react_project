import type { Metadata } from "next";
import ToastDemo from "@/screens/ui-demo/ToastDemo";

export const metadata: Metadata = { title: "토스트" };

export default function Page() {
  return <ToastDemo />;
}
