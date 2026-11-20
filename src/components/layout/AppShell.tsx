"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * 공통 레이아웃: 상단 헤더 + 왼쪽 메뉴.
 * - 데스크톱(768px 이상): 햄버거 버튼으로 메뉴 접기/펼치기
 * - 모바일: 햄버거 버튼으로 메뉴를 덮어서 열기(드로어)
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) setDesktopOpen((v) => !v);
    else setMobileOpen((v) => !v);
  };

  return (
        <div className="flex min-h-screen flex-col">
          <Header onToggleMenu={toggleMenu} />
          <div className="flex flex-1">
            {/* 데스크톱 메뉴 */}
            <aside
              className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-gray-200 bg-white ${desktopOpen ? "md:flex" : ""}`}
            >
              <Sidebar />
            </aside>

            {/* 모바일 메뉴 (드로어) */}
            {mobileOpen && (
              <div className="fixed inset-0 top-14 z-30 md:hidden">
                <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
                <aside className="relative flex h-full w-64 flex-col border-r border-gray-200 bg-white shadow-xl">
                  <Sidebar onNavigate={() => setMobileOpen(false)} />
                </aside>
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col bg-gray-50">{children}</div>
          </div>
        </div>
  );
}
