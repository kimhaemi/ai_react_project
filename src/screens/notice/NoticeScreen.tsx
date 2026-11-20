import NoticeBoard from "./NoticeBoard";

/** 공지사항 화면 */
export default function NoticeScreen() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">공지사항</h1>
      <NoticeBoard />
    </main>
  );
}
