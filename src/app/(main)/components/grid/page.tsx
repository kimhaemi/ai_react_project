import type { Metadata } from "next";
import GridDemo from "./GridDemo";

export const metadata: Metadata = { title: "그리드" };

export default function Page() {
  return <GridDemo />;
}
