"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { LANGUAGES, type Lang } from "@/i18n/dictionaries";
import { GlobeIcon } from "./icons";

export default function LanguageSelect({ className = "" }: { className?: string }) {
  const { t, lang, setLang } = useI18n();
  return (
    <label className={`flex items-center gap-1 text-gray-600 ${className}`}>
      <GlobeIcon />
      <span className="sr-only">{t("header.language")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="cursor-pointer rounded border-none bg-transparent py-1 text-sm outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
