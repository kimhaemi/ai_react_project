import type { Metadata } from "next";
import FileDownloadDemo from "./FileDownloadDemo";

export const metadata: Metadata = { title: "파일 다운로드" };

export default function Page() {
  return <FileDownloadDemo />;
}
