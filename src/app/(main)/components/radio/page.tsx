import type { Metadata } from "next";
import RadioDemo from "./RadioDemo";

export const metadata: Metadata = { title: "라디오" };

export default function Page() {
  return <RadioDemo />;
}
