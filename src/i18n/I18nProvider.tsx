"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useStoredValue } from "@/lib/useStoredValue";
import { DEFAULT_LANG, LANGUAGES, dictionaries, type Lang, type MessageKey } from "./dictionaries";

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const isLang = (v: string | null): v is Lang => LANGUAGES.some((l) => l.code === v);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredValue("lang");
  const lang: Lang = isLang(stored) ? stored : DEFAULT_LANG;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback<Translate>(
    (key, params) => {
      let text = dictionaries[lang][key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang: setStored, t }), [lang, setStored, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
