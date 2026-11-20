"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import MenuSearch from "./MenuSearch";
import LanguageSelect from "./LanguageSelect";
import { LogoIcon, MenuIcon, UserIcon } from "./icons";

export default function Header({ onToggleMenu }: { onToggleMenu: () => void }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 sm:px-4">
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label={t("header.menu")}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
      >
        <MenuIcon />
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
