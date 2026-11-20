"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { DataGrid, actionColumn, dateTimeFormatter, formatDate, type CellEditParams, type ColDef } from "@/components/ui/grid";
import { Button, Input, SearchBox, type SearchField, type SearchValues } from "@/components/ui";
import { noticeApi } from "@/lib/api/notices";
import type { Notice, NoticeInput } from "@/types/notice";
import { useUI } from "@/hooks";

type FormState = { mode: "create" } | { mode: "edit"; notice: Notice };

const EMPTY_FORM: NoticeInput = { title: "", author: "", content: "" };

const SEARCH_FIELDS: SearchField[] = [
  {
    type: "keyword",
    name: "keyword",
    typeName: "searchType",
    label: "검색어",
    options: [
      { label: "전체", value: "all" },
      { label: "제목", value: "title" },
      { label: "작성자", value: "author" },
      { label: "내용", value: "content" },
    ],
  },
  { type: "dateRange", name: "from", toName: "to", label: "작성일" },
];

const INITIAL_SEARCH: SearchValues = { searchType: "all", keyword: "", from: "", to: "" };

/** 검색 조건에 맞는지 확인 */
function matches(n: Notice, s: SearchValues) {
  const keyword = String(s.keyword ?? "").toLowerCase();
  if (keyword) {
    const type = String(s.searchType ?? "all");
    const targets = type === "all" ? [n.title, n.author, n.content] : [String(n[type as keyof Notice] ?? "")];
    if (!targets.some((t) => t.toLowerCase().includes(keyword))) return false;
  }
  const created = formatDate(n.createdAt);
  if (s.from && created < String(s.from)) return false;
  if (s.to && created > String(s.to)) return false;
  return true;
}

const errorMessage = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState<SearchValues>(INITIAL_SEARCH);
  const [form, setForm] = useState<FormState | null>(null);
  const [values, setValues] = useState<NoticeInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ui = useUI();

  // 목록 조회 (reloadKey 가 바뀌면 다시 조회)
  useEffect(() => {
    let cancelled = false;
    noticeApi
      .list()
      .then((data) => {
        if (cancelled) return;
        setNotices(data);
        setLoadError(null);
      })
      .catch((e) => !cancelled && setLoadError(errorMessage(e, "목록을 불러오지 못했습니다.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const filtered = useMemo(() => notices.filter((n) => matches(n, search)), [notices, search]);

  const openCreate = useCallback(() => {
    setValues(EMPTY_FORM);
    setError(null);
    setForm({ mode: "create" });
  }, []);

  const openEdit = useCallback((notice: Notice) => {
    setValues({ title: notice.title, author: notice.author, content: notice.content });
    setError(null);
    setForm({ mode: "edit", notice });
  }, []);

  const closeForm = () => {
    if (!isPending) setForm(null);
  };

  // 확인 → 로딩 → 삭제 → 성공/실패 토스트를 ui.run 하나로 처리
  const remove = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return;
      const result = await ui.run(() => noticeApi.remove(ids), {
        confirm: {
          message: `선택한 ${ids.length}건의 게시글을 삭제합니다.\n삭제한 글은 되돌릴 수 없습니다.`,
          title: "게시글 삭제",
          okText: "삭제",
          danger: true,
        },
        loading: "삭제 중입니다...",
        success: `${ids.length}건을 삭제했습니다.`,
      });
      if (!result) return;
      const removed = new Set(ids);
      setNotices((list) => list.filter((n) => !removed.has(n.id)));
      setSelectedIds([]);
    },
    [ui],
  );

  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    if (!values.title.trim()) return setError("제목을 입력해 주세요.");
    if (!values.author.trim()) return setError("작성자를 입력해 주세요.");
    startTransition(async () => {
      try {
        if (form.mode === "create") {
          const created = await noticeApi.create(values);
          setNotices((list) => [...list, created]);
          ui.toast.success("게시글을 등록했습니다.");
        } else {
          const updated = await noticeApi.update(form.notice.id, values);
          setNotices((list) => list.map((n) => (n.id === updated.id ? updated : n)));
          ui.toast.success("게시글을 수정했습니다.");
        }
        setForm(null);
      } catch (err) {
        setError(errorMessage(err, "저장에 실패했습니다."));
      }
    });
  };

  const columnDefs = useMemo<ColDef<Notice>[]>(
    () => [
      { field: "id", headerName: "번호", width: 90, sort: "desc", filter: false },
      { field: "title", headerName: "제목", flex: 1, minWidth: 200, editable: true, cellEditorParams: { maxLength: 200 } },
      { field: "author", headerName: "작성자", width: 130, editable: true, cellEditorParams: { maxLength: 50 } },
      { field: "createdAt", headerName: "작성일", width: 170, filter: false, valueFormatter: dateTimeFormatter },
      { field: "updatedAt", headerName: "수정일", width: 170, filter: false, valueFormatter: dateTimeFormatter },
      actionColumn<Notice>([
        { label: "수정", variant: "primary", onClick: openEdit },
        { label: "삭제", variant: "danger", onClick: (row) => remove([row.id]) },
      ]),
    ],
    [openEdit, remove],
  );

  // 셀 더블클릭 편집 → 저장 성공 시에만 목록 갱신 (실패하면 원래 값 유지)
  const saveCell = useCallback(
    async ({ data, field, newValue }: CellEditParams<Notice>) => {
      const value = String(newValue ?? "").trim();
      const label = field === "title" ? "제목" : "작성자";
      if (!value) {
        ui.toast.warning(`${label}은(는) 비워 둘 수 없습니다.`);
        return;
      }
      if (value === data[field as keyof Notice]) return;
      try {
        const updated = await noticeApi.update(data.id, {
          title: data.title,
          author: data.author,
          content: data.content,
          [field]: value,
        });
        setNotices((list) => list.map((n) => (n.id === updated.id ? updated : n)));
      } catch (e) {
        ui.toast.error(errorMessage(e, "저장에 실패했습니다."));
      }
    },
    [ui],
  );

  const isFiltered = filtered.length !== notices.length;

  return (
    <div className="flex flex-col gap-4">
      <SearchBox fields={SEARCH_FIELDS} initialValues={INITIAL_SEARCH} onSearch={setSearch} loading={loading} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">
          {isFiltered ? (
            <>
              검색 결과 <b className="text-blue-600">{filtered.length}</b>건 / 전체 {notices.length}건
            </>
          ) : (
            <>
              총 <b>{notices.length}</b>건
            </>
          )}
        </span>
        <Button size="sm" variant="ghost" onClick={reload} disabled={loading}>
          새로고침
        </Button>
        <div className="ml-auto flex gap-2">
          <Button variant="danger" onClick={() => remove(selectedIds)} disabled={selectedIds.length === 0 || isPending}>
            선택 삭제{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
          <Button onClick={openCreate} disabled={isPending}>
            등록
          </Button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1">{loadError}</span>
          <Button size="sm" variant="secondary" onClick={reload}>
            다시 시도
          </Button>
        </div>
      )}

      <DataGrid<Notice>
        loading={loading}
        rowData={filtered}
        columnDefs={columnDefs}
        rowIdField="id"
        rowSelection={{ mode: "multiRow" }}
        emptyMessage={isFiltered ? "검색 결과가 없습니다." : "등록된 게시글이 없습니다."}
        onCellEdit={saveCell}
        onSelectionChanged={(e) => setSelectedIds(e.api.getSelectedRows().map((r) => r.id))}
      />
      <p className="text-xs text-gray-500">제목·작성자 칸을 더블클릭하면 바로 고칠 수 있습니다. (Enter 저장, Esc 취소) 내용까지 고치려면 [수정] 버튼을 누르세요.</p>

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && closeForm()}
        >
          <form onSubmit={submit} className="flex w-full max-w-2xl flex-col gap-4 rounded-lg bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="text-lg font-semibold">
              {form.mode === "create" ? "공지사항 등록" : `공지사항 수정 (#${form.notice.id})`}
            </h2>

            <Input
              label="제목"
              required
              autoFocus
              maxLength={200}
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            />
            <Input
              label="작성자"
              required
              maxLength={50}
              value={values.author}
              onChange={(e) => setValues((v) => ({ ...v, author: e.target.value }))}
            />

            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              내용
              <textarea
                rows={10}
                maxLength={10000}
                value={values.content}
                onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
                className="resize-y rounded-md border border-gray-300 px-3 py-2 font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeForm} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" loading={isPending}>
                {form.mode === "create" ? "등록" : "저장"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
