import type { Metadata } from "next";
import ButtonDemo from "./ButtonDemo";

export const metadata: Metadata = { title: "버튼" };

export default function Page() {
  return <ButtonDemo />;
}
