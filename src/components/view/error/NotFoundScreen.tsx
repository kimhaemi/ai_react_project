"use client";

import Link from "next/link";
import { useI18n } from "@/hooks";

export default function NotFoundScreen() {
  const { t } = useI18n();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <h1 className="text-xl font-semibold">{t("page.notFound.title")}</h1>
      <p className="text-gray-600">{t("page.notFound.desc")}</p>
      <Link href="/" className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
        {t("page.notFound.home")}
      </Link>
    </main>
  );
}
