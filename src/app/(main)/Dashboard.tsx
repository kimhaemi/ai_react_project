"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function Dashboard() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">{t("menu.dashboard")}</h1>
      <p className="text-gray-600">{t("page.dashboard.welcome")}</p>
    </main>
  );
}
