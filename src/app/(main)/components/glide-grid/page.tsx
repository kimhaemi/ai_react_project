import type { Metadata } from "next";
import { GlideGridDemo } from "@/components/view/ui-demo/GridDemoLoaders";

export const metadata: Metadata = { title: "Glide Data Grid" };

export default function Page() {
  return <GlideGridDemo />;
}
