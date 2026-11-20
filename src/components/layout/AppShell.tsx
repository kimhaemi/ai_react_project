"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useStoredValue } from "@/lib/useStoredValue";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DESKTOP_QUERY = "(min-width: 768px)";
/** 접힌 메뉴에 마우스를 올린 뒤 펼쳐지기까지 / 벗어난 뒤 접히기까지 (ms) */
const PEEK_OPEN_DELAY = 120;
const PEEK_CLOSE_DELAY = 250;

/**
 * 공통 레이아웃: 상단 헤더 + 왼쪽 메뉴.
 * - PC(768px 이상): 햄버거 버튼으로 메뉴를 아이콘만 보이게 접기/펼치기 (상태는 브라우저에 기억)
 *   접힌 상태에서 마우스를 올리면(또는 키보드 포커스) 메뉴가 잠시 펼쳐짐
 * - 모바일: 햄버거 버튼으로 메뉴가 왼쪽에서 밀려 나옴
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredValue("sidebar.collapsed");
  const collapsed = stored === "1";
  const [peek, setPeek] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const peekTimer = useRef(0);

  const expanded = !collapsed || peek;

  const schedulePeek = (next: boolean) => {
    window.clearTimeout(peekTimer.current);
    if (!collapsed) return;
    peekTimer.current = window.setTimeout(() => setPeek(next), next ? PEEK_OPEN_DELAY : PEEK_CLOSE_DELAY);
  };

  useEffect(() => () => window.clearTimeout(peekTimer.current), []);

  // 모바일 메뉴: Esc 로 닫기
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleMenu = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      window.clearTimeout(peekTimer.current);
      setPeek(false);
      setStored(collapsed ? null : "1");
    } else {
      setMobileOpen((v) => !v);
    }
  };

  const motion = "duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

  return (
    <div className="flex min-h-screen flex-col">
      <Header onToggleMenu={toggleMenu} mobileMenuOpen={mobileOpen} desktopCollapsed={collapsed} />
      <div className="flex flex-1">
        {/* PC 메뉴: 바깥 칸은 본문을 밀어내는 폭, 안쪽 aside 는 펼쳐질 때(마우스 올림) 본문 위로 겹쳐서 보임 */}
        <div className={cn("relative z-20 hidden shrink-0 transition-[width] md:block", motion, collapsed ? "w-16" : "w-64")}>
          <aside
            onMouseEnter={() => schedulePeek(true)}
            onMouseLeave={() => schedulePeek(false)}
            onFocus={() => schedulePeek(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) schedulePeek(false);
            }}
            className={cn(
              "sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden border-r border-gray-200 bg-white transition-[width,box-shadow]",
              motion,
              expanded ? "w-64" : "w-16",
              collapsed && peek && "shadow-[4px_0_24px_-4px_rgba(0,0,0,0.15)]",
            )}
          >
            <Sidebar compact={!expanded} />
          </aside>
        </div>

        {/* 모바일 메뉴: 항상 그려 두고 밀어 넣기/빼기 */}
        <div
          className={cn("fixed inset-0 top-14 z-30 md:hidden", !mobileOpen && "pointer-events-none")}
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
        >
          <div
            className={cn("absolute inset-0 bg-black/30 transition-opacity", motion, mobileOpen ? "opacity-100" : "opacity-0")}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={cn(
              "relative flex h-full w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-xl transition-transform",
              motion,
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-gray-50">{children}</div>
      </div>
    </div>
  );
}
