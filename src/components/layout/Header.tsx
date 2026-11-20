"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuSearch from "./MenuSearch";
import LanguageSelect from "./LanguageSelect";
import { cn } from "@/lib/cn";
import { LogoIcon, UserIcon } from "./icons";
import { useAuth, useI18n } from "@/hooks";

interface HeaderProps {
  onToggleMenu: () => void;
  /** 모바일 메뉴가 열려 있으면 햄버거가 X 로 바뀜 */
  mobileMenuOpen: boolean;
  /** PC 메뉴가 접혀 있는지 */
  desktopCollapsed: boolean;
}

export default function Header({ onToggleMenu, mobileMenuOpen, desktopCollapsed }: HeaderProps) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 sm:px-4">
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label={t("header.menu")}
        aria-expanded={mobileMenuOpen || undefined}
        data-collapsed={desktopCollapsed || undefined}
        className={cn(
          "group flex size-10 items-center justify-center rounded-lg text-gray-600 outline-none",
          "transition-[background-color,color,transform] duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-90",
          "focus-visible:ring-2 focus-visible:ring-blue-300 motion-reduce:transition-none",
        )}
      >
        <HamburgerIcon open={mobileMenuOpen} />
      </button>

      <Link href="/" className="flex shrink-0 items-center gap-2">
        <LogoIcon />
        <span className="hidden text-base font-bold text-gray-900 sm:inline">{t("app.name")}</span>
      </Link>

      <div className="flex min-w-0 flex-1 justify-center px-2">
        <MenuSearch />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageSelect />

        {user ? (
          <>
            <span className="hidden items-center gap-1 text-sm text-gray-700 md:flex">
              <UserIcon />
              {t("header.welcome", { name: user.name })}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              {t("header.logout")}
            </button>
          </>
        ) : (
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            {t("header.login")}
          </Link>
        )}
      </div>

    </header>
  );
}

/**
 * 햄버거 아이콘: 마우스를 올리면 가운데 줄이 짧아지고, 열리면(모바일) X 로 바뀜
 * PC 에서 메뉴가 접혀 있으면 줄 길이가 엇갈려서 "펼칠 수 있음"을 표시
 */
function HamburgerIcon({ open }: { open: boolean }) {
  const line = "absolute left-0 h-0.5 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";
  return (
    <span className="relative block h-3.5 w-5" aria-hidden>
      <span className={cn(line, "top-0 w-5", open && "top-1.5 rotate-45")} />
      <span
        className={cn(
          line,
          "top-1.5",
          open ? "w-0 opacity-0" : "w-5 group-hover:w-3 group-data-[collapsed]:w-3 group-data-[collapsed]:group-hover:w-5",
        )}
      />
      <span className={cn(line, "top-3 w-5", open ? "top-1.5 -rotate-45" : "group-hover:w-4 group-data-[collapsed]:w-4")} />
    </span>
  );
}
