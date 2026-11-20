"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/I18nProvider";
import { Checkbox } from "./Checkbox";

export interface TreeNode {
  id: string;
  label: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  icon?: ReactNode;
}

export interface TreeProps {
  nodes: TreeNode[];
  /** 선택된 노드 id (행 클릭) */
  selectedId?: string | null;
  onSelect?: (node: TreeNode) => void;
  /** 체크박스 표시 */
  checkable?: boolean;
  /** 체크된 "끝 노드(leaf)" id 목록. 상위 노드는 하위 상태로 자동 계산됨 */
  checkedIds?: string[];
  defaultCheckedIds?: string[];
  onCheckedChange?: (leafIds: string[]) => void;
  /** 펼친 노드 id 목록. 지정하지 않으면 내부에서 관리 */
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  className?: string;
}

/** 하위 노드가 있는 모든 노드 id (모두 펼치기용) */
export function getBranchIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => (n.children?.length ? [n.id, ...getBranchIds(n.children)] : []));
}

/** 모든 끝 노드 id */
export function getLeafIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => (n.children?.length ? getLeafIds(n.children) : [n.id]));
}

export function Tree({
  nodes,
  selectedId,
  onSelect,
  checkable,
  checkedIds,
  defaultCheckedIds = [],
  onCheckedChange,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedChange,
  className,
}: TreeProps) {
  const [innerExpanded, setInnerExpanded] = useState(defaultExpandedIds);
  const [innerChecked, setInnerChecked] = useState(defaultCheckedIds);
  const expanded = useMemo(() => new Set(expandedIds ?? innerExpanded), [expandedIds, innerExpanded]);
  const checked = useMemo(() => new Set(checkedIds ?? innerChecked), [checkedIds, innerChecked]);

  // 각 노드 아래의 (비활성 제외) 끝 노드 목록
  const leavesOf = useMemo(() => {
    const map = new Map<string, string[]>();
    const walk = (n: TreeNode, parentDisabled: boolean): string[] => {
      const off = parentDisabled || !!n.disabled;
      const leaves = n.children?.length ? n.children.flatMap((c) => walk(c, off)) : off ? [] : [n.id];
      map.set(n.id, leaves);
      return leaves;
    };
    nodes.forEach((n) => walk(n, false));
    return map;
  }, [nodes]);

  const toggleExpand = (id: string) => {
    const next = expanded.has(id) ? [...expanded].filter((x) => x !== id) : [...expanded, id];
    if (expandedIds === undefined) setInnerExpanded(next);
    onExpandedChange?.(next);
  };

  const toggleCheck = (id: string, on: boolean) => {
    const leaves = leavesOf.get(id) ?? [];
    const next = new Set(checked);
    leaves.forEach((l) => (on ? next.add(l) : next.delete(l)));
    const list = [...next];
    if (checkedIds === undefined) setInnerChecked(list);
    onCheckedChange?.(list);
  };

  return (
    <ul role="tree" className={cn("text-sm", className)}>
      {nodes.map((n) => (
        <TreeItem
          key={n.id}
          node={n}
          depth={0}
          expanded={expanded}
          checked={checked}
          leavesOf={leavesOf}
          selectedId={selectedId}
          onSelect={onSelect}
          checkable={checkable}
          toggleExpand={toggleExpand}
          toggleCheck={toggleCheck}
          parentDisabled={false}
        />
      ))}
    </ul>
  );
}

interface ItemProps {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  checked: Set<string>;
  leavesOf: Map<string, string[]>;
  selectedId?: string | null;
  onSelect?: (node: TreeNode) => void;
  checkable?: boolean;
  toggleExpand: (id: string) => void;
  toggleCheck: (id: string, on: boolean) => void;
  parentDisabled: boolean;
}

function TreeItem(props: ItemProps) {
  const { node, depth, expanded, checked, leavesOf, selectedId, onSelect, checkable, toggleExpand, toggleCheck, parentDisabled } = props;
  const { t } = useI18n();
  const hasChildren = !!node.children?.length;
  const isOpen = hasChildren && expanded.has(node.id);
  const disabled = parentDisabled || !!node.disabled;
  const selected = selectedId === node.id;

  const leaves = leavesOf.get(node.id) ?? [];
  const checkedCount = leaves.filter((l) => checked.has(l)).length;
  const allChecked = leaves.length > 0 && checkedCount === leaves.length;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={selected} aria-disabled={disabled || undefined}>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md py-1 pr-2",
          selected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100",
          disabled && "opacity-50",
        )}
        style={{ paddingLeft: depth * 20 + 4 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggleExpand(node.id)}
            aria-label={isOpen ? t("ui.tree.collapse") : t("ui.tree.expand")}
            className="flex size-6 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200"
          >
            <svg viewBox="0 0 24 24" className={cn("size-4 transition-transform", isOpen && "rotate-90")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        ) : (
          <span className="size-6 shrink-0" />
        )}

        {checkable && (
          <Checkbox
            aria-label={typeof node.label === "string" ? node.label : node.id}
            checked={allChecked}
            indeterminate={checkedCount > 0 && !allChecked}
            disabled={disabled || leaves.length === 0}
            onChange={(e) => toggleCheck(node.id, e.target.checked)}
            className="mr-1"
          />
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => (onSelect ? onSelect(node) : hasChildren && toggleExpand(node.id))}
          onDoubleClick={() => hasChildren && onSelect && toggleExpand(node.id)}
          className={cn("flex min-w-0 flex-1 items-center gap-1.5 text-left", disabled ? "cursor-not-allowed" : "cursor-pointer", selected && "font-semibold")}
        >
          {node.icon && <span className="shrink-0 text-gray-500">{node.icon}</span>}
          <span className="truncate">{node.label}</span>
        </button>
      </div>

      {isOpen && (
        <ul role="group">
          {node.children!.map((c) => (
            <TreeItem key={c.id} {...props} node={c} depth={depth + 1} parentDisabled={disabled} />
          ))}
        </ul>
      )}
    </li>
  );
}
