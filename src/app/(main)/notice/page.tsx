import type { Metadata } from "next";
import NoticeScreen from "@/components/view/notice/NoticeScreen";

export const metadata: Metadata = { title: "공지사항" };

export default function Page() {
  return <NoticeScreen />;
}
