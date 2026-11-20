import type { Metadata } from "next";
import TreeDemo from "@/screens/ui-demo/TreeDemo";

export const metadata: Metadata = { title: "트리" };

export default function Page() {
  return <TreeDemo />;
}
