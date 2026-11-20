"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { DataGrid, actionColumn, dateTimeFormatter, type ColDef } from "@/components/grid";
import { noticeApi } from "@/lib/api/notices";
import type { Notice, NoticeInput } from "@/types/notice";

type FormState = { mode: "create" } | { mode: "edit"; notice: Notice };

const EMPTY_FORM: NoticeInput = { title: "", author: "", content: "" };

const errorMessage = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [values, setValues] = useState<NoticeInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const remove = useCallback((ids: number[]) => {
    if (ids.length === 0) return;
    if (!window.confirm(`${ids.length}건의 게시글을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await noticeApi.remove(ids);
        const removed = new Set(ids);
        setNotices((list) => list.filter((n) => !removed.has(n.id)));
        setSelectedIds([]);
      } catch (e) {
        window.alert(errorMessage(e, "삭제에 실패했습니다."));
      }
    });
  }, []);

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
        } else {
          const updated = await noticeApi.update(form.notice.id, values);
          setNotices((list) => list.map((n) => (n.id === updated.id ? updated : n)));
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
      { field: "title", headerName: "제목", flex: 1, minWidth: 200 },
      { field: "author", headerName: "작성자", width: 130 },
      { field: "createdAt", headerName: "작성일", width: 170, filter: false, valueFormatter: dateTimeFormatter },
      { field: "updatedAt", headerName: "수정일", width: 170, filter: false, valueFormatter: dateTimeFormatter },
      actionColumn<Notice>([
        { label: "수정", variant: "primary", onClick: openEdit },
        { label: "삭제", variant: "danger", onClick: (row) => remove([row.id]) },
      ]),
    ],
    [openEdit, remove],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-64 rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
        <span className="text-sm text-gray-500">총 {notices.length}건</span>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          새로고침
        </button>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => remove(selectedIds)}
            disabled={selectedIds.length === 0 || isPending}
            className="rounded bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-40"
          >
            선택 삭제{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </button>
          <button
            type="button"
            onClick={openCreate}
            disabled={isPending}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-40"
          >
            등록
          </button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1">{loadError}</span>
          <button type="button" onClick={reload} className="rounded border border-red-300 px-3 py-1 hover:bg-red-100">
            다시 시도
          </button>
        </div>
      )}

      <DataGrid<Notice>
        loading={loading}
        rowData={notices}
        columnDefs={columnDefs}
        rowIdField="id"
        rowSelection={{ mode: "multiRow" }}
        quickFilterText={search}
        emptyMessage="등록된 게시글이 없습니다."
        onRowDoubleClicked={(e) => e.data && openEdit(e.data)}
        onSelectionChanged={(e) => setSelectedIds(e.api.getSelectedRows().map((r) => r.id))}
      />
      <p className="text-xs text-gray-500">행을 더블클릭하면 수정할 수 있습니다.</p>

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && closeForm()}
        >
          <form
            onSubmit={submit}
            className="flex w-full max-w-2xl flex-col gap-4 rounded-lg bg-white p-6 text-gray-900 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {form.mode === "create" ? "공지사항 등록" : `공지사항 수정 (#${form.notice.id})`}
            </h2>

            <label className="flex flex-col gap-1 text-sm">
              제목 *
              <input
                autoFocus
                maxLength={200}
                value={values.title}
                onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              작성자 *
              <input
                maxLength={50}
                value={values.author}
                onChange={(e) => setValues((v) => ({ ...v, author: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              내용
              <textarea
                rows={10}
                maxLength={10000}
                value={values.content}
                onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
                className="resize-y rounded border border-gray-300 px-3 py-2"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={isPending}
                className="rounded border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-40"
              >
                {isPending ? "저장 중..." : form.mode === "create" ? "등록" : "저장"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
