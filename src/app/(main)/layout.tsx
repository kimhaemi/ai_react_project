import AppShell from "@/components/layout/AppShell";

/** 헤더 + 왼쪽 메뉴가 있는 일반 화면 */
export default function MainLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
