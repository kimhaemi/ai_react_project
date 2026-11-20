import type { MessageKey } from "@/i18n/dictionaries";

export interface MenuItem {
  id: string;
  /** 다국어 키 (src/i18n/dictionaries.ts) */
  labelKey: MessageKey;
  /** 하위 메뉴가 없는 항목만 링크를 가짐 */
  href?: string;
  icon?: "home" | "board" | "settings";
  children?: MenuItem[];
}

/** 왼쪽 메뉴 (최대 3depth). 메뉴 추가/변경은 여기서만 하면 됨 */
export const MENU: MenuItem[] = [
  { id: "dashboard", labelKey: "menu.dashboard", href: "/", icon: "home" },
  {
    id: "board",
    labelKey: "menu.board",
    icon: "board",
    children: [
      { id: "notice", labelKey: "menu.board.notice", href: "/notice" },
      {
        id: "archive",
        labelKey: "menu.board.archive",
        children: [
          { id: "docs", labelKey: "menu.board.archive.docs", href: "/board/docs" },
          { id: "images", labelKey: "menu.board.archive.images", href: "/board/images" },
        ],
      },
    ],
  },
  {
    id: "system",
    labelKey: "menu.system",
    icon: "settings",
    children: [
      {
        id: "users",
        labelKey: "menu.system.users",
        children: [
          { id: "user-list", labelKey: "menu.system.users.list", href: "/admin/users" },
          { id: "roles", labelKey: "menu.system.users.roles", href: "/admin/roles" },
        ],
      },
      { id: "settings", labelKey: "menu.system.settings", href: "/admin/settings" },
    ],
  },
];

export interface FlatMenuItem {
  item: MenuItem;
  /** 루트부터 자신까지의 경로 */
  trail: MenuItem[];
}

/** 링크가 있는 메뉴만 평탄화 (검색용) */
export function flattenMenu(items: MenuItem[] = MENU, trail: MenuItem[] = []): FlatMenuItem[] {
  return items.flatMap((item) => {
    const path = [...trail, item];
    const self = item.href ? [{ item, trail: path }] : [];
    return [...self, ...flattenMenu(item.children ?? [], path)];
  });
}

/** 현재 경로에 해당하는 메뉴의 상위 메뉴 id 목록 */
export function findActiveTrail(pathname: string, items: MenuItem[] = MENU): string[] {
  const match = flattenMenu(items)
    .filter(({ item }) =>
      item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => (b.item.href?.length ?? 0) - (a.item.href?.length ?? 0))[0];
  return match ? match.trail.map((m) => m.id) : [];
}
