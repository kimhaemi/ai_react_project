"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { MENU, findActiveTrail, type MenuItem } from "@/config/menu";
import { cn } from "@/lib/cn";
import { ChevronIcon, MenuItemIcon } from "./icons";
import { useI18n } from "@/hooks";

// depth 별 들여쓰기/글자 스타일
const depthStyle = ["pl-3 font-medium text-gray-800", "pl-9 text-gray-700", "pl-14 text-sm text-gray-600"];

/**
 * 왼쪽 메뉴 (3depth)
 * @param compact 접힌 상태(아이콘만). 하위 메뉴는 닫고 글자는 숨김
 */
export default function Sidebar({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const pathname = usePathname();
  const activeTrail = useMemo(() => findActiveTrail(pathname), [pathname]);
  const activeId = activeTrail.at(-1);
  // 사용자가 직접 열고 닫은 상태. 건드리지 않은 메뉴는 현재 페이지의 상위 메뉴만 펼침
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const isOpen = (id: string) => !compact && (toggled[id] ?? activeTrail.includes(id));
  const toggle = (id: string) => setToggled((s) => ({ ...s, [id]: !(s[id] ?? activeTrail.includes(id)) }));

  return (
    // 폭을 고정해 두고 바깥(aside)이 잘라서 보여줌 → 접힐 때 글자가 줄바꿈되며 흔들리지 않음
    <nav className="w-64 flex-1 overflow-x-hidden overflow-y-auto p-2" aria-label="Main">
      <MenuList
        items={MENU}
        depth={0}
        activeId={activeId}
        activeTrail={activeTrail}
        isOpen={isOpen}
        toggle={toggle}
        onNavigate={onNavigate}
        compact={compact}
      />
    </nav>
  );
}

interface MenuListProps {
  items: MenuItem[];
  depth: number;
  activeId?: string;
  activeTrail: string[];
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  onNavigate?: () => void;
  compact: boolean;
}

function MenuList({ items, depth, activeId, activeTrail, isOpen, toggle, onNavigate, compact }: MenuListProps) {
  const { t } = useI18n();

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const hasChildren = !!item.children?.length;
        const open = hasChildren && isOpen(item.id);
        const active = item.id === activeId;
        // 현재 페이지의 상위 메뉴 (접힌 상태에서도 어느 묶음인지 보이도록 강조)
        const inTrail = !active && activeTrail.includes(item.id);
        const label = t(item.labelKey);

        const row = cn(
          "group relative flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left outline-none",
          "transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900",
          "focus-visible:ring-2 focus-visible:ring-blue-300",
          depthStyle[depth] ?? depthStyle.at(-1),
          active && "bg-blue-50 font-semibold !text-blue-700 hover:bg-blue-100",
          inTrail && "!text-blue-700",
          // 현재 페이지 왼쪽 표시줄
          active && "before:absolute before:top-1/2 before:left-0 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-blue-600",
        );
        const content = (
          <>
            {item.icon && (
              <MenuItemIcon
                name={item.icon}
                className={cn(
                  "size-4 shrink-0 transition-colors duration-150",
                  active || inTrail ? "text-blue-600" : "text-gray-500 group-hover:text-gray-800",
                )}
              />
            )}
            <span className={cn("flex-1 truncate transition-opacity duration-200", compact ? "opacity-0" : "opacity-100")}>{label}</span>
          </>
        );

        return (
          <li key={item.id}>
            {hasChildren ? (
              <button
                type="button"
                className={row}
                aria-expanded={open}
                title={compact ? label : undefined}
                onClick={() => toggle(item.id)}
              >
                {content}
                <ChevronIcon
                  className={cn(
                    "size-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover:text-gray-600",
                    open && "rotate-90",
                    compact && "opacity-0",
                  )}
                />
              </button>
            ) : (
              <Link
                href={item.href ?? "#"}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={compact ? label : undefined}
                className={row}
              >
                {content}
              </Link>
            )}
            {hasChildren && (
              // 하위 메뉴 높이 애니메이션 (grid-rows 0fr ↔ 1fr). 닫혀 있으면 inert 로 Tab 이동에서 제외
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
                inert={!open}
              >
                <div className="overflow-hidden">
                  <div className="pt-0.5">
                    <MenuList
                      items={item.children!}
                      depth={depth + 1}
                      activeId={activeId}
                      activeTrail={activeTrail}
                      isOpen={isOpen}
                      toggle={toggle}
                      onNavigate={onNavigate}
                      compact={compact}
                    />
                  </div>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
