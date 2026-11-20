import type { Metadata } from "next";
import SearchBoxDemo from "./SearchBoxDemo";

export const metadata: Metadata = { title: "검색박스" };

export default function Page() {
  return <SearchBoxDemo />;
}
