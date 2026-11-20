import type { Metadata } from "next";
import FileUploadDemo from "./FileUploadDemo";

export const metadata: Metadata = { title: "파일 업로드" };

export default function Page() {
  return <FileUploadDemo />;
}
