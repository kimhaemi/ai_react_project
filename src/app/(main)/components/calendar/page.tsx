import type { Metadata } from "next";
import CalendarDemo from "@/screens/ui-demo/CalendarDemo";

export const metadata: Metadata = { title: "달력" };

export default function Page() {
  return <CalendarDemo />;
}
