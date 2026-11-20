import type { Metadata } from "next";
import DashboardScreen from "@/components/view/dashboard/DashboardScreen";

export const metadata: Metadata = { title: "대시보드" };

export default function Page() {
  return <DashboardScreen />;
}
