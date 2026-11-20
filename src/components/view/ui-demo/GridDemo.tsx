"use client";

import { useCallback, useMemo, useState } from "react";
import { DataGrid, actionColumn, moveItem, type CellEditParams, type ColDef } from "@/components/ui/grid";
import { Button } from "@/components/ui";
import { DemoPage, DemoSection, ValueView } from "./Demo";
import { useToast } from "@/hooks";

interface Task {
  id: number;
  name: string;
  owner: string;
  status: string;
  progress: number;
}

const OWNERS = ["김민준", "이서연", "박지훈", "최수아"];
const STATUSES = ["대기", "진행 중", "검토", "완료"];

const INITIAL: Task[] = [
  { id: 1, name: "로그인 화면 디자인", owner: "이서연", status: "완료", progress: 100 },
  { id: 2, name: "공지사항 API 개발", owner: "김민준", status: "진행 중", progress: 70 },
  { id: 3, name: "파일 업로드 검증", owner: "박지훈", status: "검토", progress: 90 },
  { id: 4, name: "권한 관리 기획", owner: "최수아", status: "대기", progress: 0 },
  { id: 5, name: "대시보드 차트", owner: "김민준", status: "진행 중", progress: 40 },
  { id: 6, name: "운영 배포 준비", owner: "박지훈", status: "대기", progress: 10 },
];

export default function GridDemo() {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [order, setOrder] = useState<number[]>(INITIAL.map((t) => t.id));

  // 셀 편집: 값 검사 후 새 배열로 교체 (실제 화면에서는 여기서 API 저장)
  const saveCell = useCallback(
    ({ data, field, newValue }: CellEditParams<Task>) => {
      let value: string | number = typeof newValue === "string" ? newValue.trim() : (newValue as number);
      if (field === "name" && !value) {
        toast.warning("작업명은 비워 둘 수 없습니다.");
        return;
      }
      if (field === "progress") {
        value = Number(newValue);
        if (!Number.isFinite(value) || value < 0 || value > 100) {
          toast.warning("진행률은 0~100 사이로 입력하세요.");
          return;
        }
      }
      setTasks((list) => list.map((t) => (t.id === data.id ? { ...t, [field]: value } : t)));
    },
    [toast],
  );

  const move = useCallback((id: number, delta: number) => {
    setTasks((list) => {
      const from = list.findIndex((t) => t.id === id);
      return moveItem(list, from, from + delta);
    });
  }, []);

  const columns = useMemo<ColDef<Task>[]>(
    () => [
      { headerName: "순서", width: 70, valueGetter: (p) => (p.node?.rowIndex ?? 0) + 1 },
      { field: "name", headerName: "작업명", flex: 1, minWidth: 180, editable: true, cellEditorParams: { maxLength: 100 } },
      {
        field: "owner",
        headerName: "담당자",
        width: 120,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: OWNERS },
      },
      {
        field: "status",
        headerName: "상태",
        width: 110,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: STATUSES },
      },
      {
        field: "progress",
        headerName: "진행률",
        width: 100,
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: { min: 0, max: 100, precision: 0 },
        valueFormatter: (p) => `${p.value}%`,
        type: "rightAligned",
      },
      // 마우스 없이도 순서를 바꿀 수 있도록 위/아래 버튼
      actionColumn<Task>(
        [
          { label: "▲", onClick: (row) => move(row.id, -1), hidden: (row) => tasks[0]?.id === row.id },
          { label: "▼", onClick: (row) => move(row.id, 1), hidden: (row) => tasks.at(-1)?.id === row.id },
        ],
        { headerName: "이동", width: 110 },
      ),
    ],
    [move, tasks],
  );

  const changed = order.join(",") !== tasks.map((t) => t.id).join(",");

  return (
    <DemoPage
      title="Grid (셀 편집 / 순서 바꾸기)"
      description="공통 DataGrid 에 onCellEdit 를 주면 셀을 더블클릭해서 고칠 수 있고, onRowOrderChange 를 주면 행을 끌어서 순서를 바꿀 수 있습니다."
    >
      <DemoSection
        title="셀 편집 + 순서 바꾸기"
        description="파란 밑줄이 생기는 칸을 더블클릭(또는 Enter/F2)해서 고칩니다. Enter 저장, Esc 취소. 맨 앞 ⠿ 를 끌어서 놓거나 ▲▼ 버튼으로 순서를 바꿉니다."
        code={`<DataGrid
  rowData={tasks}
  columnDefs={[
    { field: "name", editable: true },                                         // 글자
    { field: "owner", editable: true, cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: OWNERS } },                                  // 목록에서 선택
    { field: "progress", editable: true, cellEditor: "agNumberCellEditor" },   // 숫자
  ]}
  rowIdField="id"
  onCellEdit={({ data, field, newValue }) => save(data.id, field, newValue)}  // 저장 성공 시 rowData 갱신
  onRowOrderChange={(rows) => setTasks(rows)}                               // 바뀐 순서 전체
/>`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">{changed ? "순서가 바뀌었습니다." : "저장된 순서입니다."}</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => (setTasks(INITIAL), setOrder(INITIAL.map((t) => t.id)))}>
              처음으로
            </Button>
            <Button
              size="sm"
              disabled={!changed}
              onClick={() => {
                setOrder(tasks.map((t) => t.id));
                toast.success("순서를 저장했습니다.");
              }}
            >
              순서 저장
            </Button>
          </div>
        </div>
        <DataGrid<Task>
          rowData={tasks}
          columnDefs={columns}
          rowIdField="id"
          height={360}
          onCellEdit={saveCell}
          onRowOrderChange={setTasks}
        />
        <ValueView value={tasks.map((t) => `${t.id}:${t.name}(${t.owner}/${t.status}/${t.progress}%)`)} />
      </DemoSection>
    </DemoPage>
  );
}
