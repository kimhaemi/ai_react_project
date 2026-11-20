import type { Metadata } from "next";
import NoticeBoard from "./NoticeBoard";

export const metadata: Metadata = { title: "공지사항" };

export default function NoticePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">공지사항</h1>
      <NoticeBoard />
    </main>
  );
}
