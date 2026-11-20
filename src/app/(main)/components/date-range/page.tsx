import type { Metadata } from "next";
import DateRangeDemo from "@/screens/ui-demo/DateRangeDemo";

export const metadata: Metadata = { title: "기간 달력" };

export default function Page() {
  return <DateRangeDemo />;
}
