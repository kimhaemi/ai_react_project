import type { Metadata } from "next";
import TreeDemo from "./TreeDemo";

export const metadata: Metadata = { title: "트리" };

export default function Page() {
  return <TreeDemo />;
}
