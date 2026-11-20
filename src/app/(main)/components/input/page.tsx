import type { Metadata } from "next";
import InputDemo from "./InputDemo";

export const metadata: Metadata = { title: "입력창" };

export default function Page() {
  return <InputDemo />;
}
