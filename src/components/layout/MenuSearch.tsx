"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { flattenMenu } from "@/config/menu";
import { useI18n } from "@/i18n/I18nProvider";
import { SearchIcon } from "./icons";

/** 헤더 검색바: 전체 메뉴(3depth 포함)를 이름으로 검색해서 이동 */
export default function MenuSearch() {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flattenMenu()
      .map(({ item, trail }) => ({ href: item.href!, path: trail.map((m) => t(m.labelKey)) }))
      .filter((r) => r.path.join(" ").toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, t]);

  const go = (href: string) => {
    router.push(href);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showList = open && query.trim() !== "";

  return (
    <div className="relative w-full max-w-md">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls="menu-search-results"
        aria-label={t("header.search")}
        placeholder={t("header.search")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="w-full rounded-md border border-gray-300 bg-gray-50 py-1.5 pr-3 pl-9 text-sm outline-none focus:border-blue-500 focus:bg-white"
      />
      {showList && (
        <ul
          id="menu-search-results"
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">{t("header.searchEmpty")}</li>
          ) : (
            results.map((r, i) => (
              <li
                key={r.href}
                role="option"
                aria-selected={i === active}
                // blur 보다 먼저 실행되도록 mousedown 사용
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(r.href);
                }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-3 py-2 text-sm ${i === active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
              >
                <span className="font-medium">{r.path.at(-1)}</span>
                {r.path.length > 1 && (
                  <span className="ml-2 text-xs text-gray-400">{r.path.slice(0, -1).join(" › ")}</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
