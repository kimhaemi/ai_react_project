"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { MENU, findActiveTrail, type MenuItem } from "@/config/menu";
import { useI18n } from "@/i18n/I18nProvider";
import { ChevronIcon, MenuItemIcon } from "./icons";

// depth 별 들여쓰기/글자 스타일
const depthStyle = ["pl-3 font-medium text-gray-800", "pl-9 text-gray-700", "pl-14 text-sm text-gray-600"];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeTrail = useMemo(() => findActiveTrail(pathname), [pathname]);
  const activeId = activeTrail.at(-1);
  // 사용자가 직접 열고 닫은 상태. 건드리지 않은 메뉴는 현재 페이지의 상위 메뉴만 펼침
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const isOpen = (id: string) => toggled[id] ?? activeTrail.includes(id);
  const toggle = (id: string) => setToggled((s) => ({ ...s, [id]: !isOpen(id) }));

  return (
    <nav className="flex-1 overflow-y-auto p-2" aria-label="Main">
      <MenuList items={MENU} depth={0} activeId={activeId} isOpen={isOpen} toggle={toggle} onNavigate={onNavigate} />
    </nav>
  );
}

interface MenuListProps {
  items: MenuItem[];
  depth: number;
  activeId?: string;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  onNavigate?: () => void;
}

function MenuList({ items, depth, activeId, isOpen, toggle, onNavigate }: MenuListProps) {
  const { t } = useI18n();

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const hasChildren = !!item.children?.length;
        const open = hasChildren && isOpen(item.id);
        const active = item.id === activeId;
        const row = `flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left hover:bg-gray-100 ${depthStyle[depth] ?? depthStyle.at(-1)}`;
        const content = (
          <>
            {item.icon && <MenuItemIcon name={item.icon} className="size-4 shrink-0" />}
            <span className="flex-1 truncate">{t(item.labelKey)}</span>
          </>
        );

        return (
          <li key={item.id}>
            {hasChildren ? (
              <button type="button" className={row} aria-expanded={open} onClick={() => toggle(item.id)}>
                {content}
                <ChevronIcon className={`size-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
              </button>
            ) : (
              <Link
                href={item.href ?? "#"}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`${row} ${active ? "bg-blue-50 !text-blue-700 font-semibold" : ""}`}
              >
                {content}
              </Link>
            )}
            {open && (
              <MenuList
                items={item.children!}
                depth={depth + 1}
                activeId={activeId}
                isOpen={isOpen}
                toggle={toggle}
                onNavigate={onNavigate}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
