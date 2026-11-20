import type { Metadata } from "next";
import DialogDemo from "@/screens/ui-demo/DialogDemo";

export const metadata: Metadata = { title: "알림/확인 팝업" };

export default function Page() {
  return <DialogDemo />;
}
