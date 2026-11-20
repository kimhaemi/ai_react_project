"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, DownloadButton, FileUpload, useDialog, useToast } from "@/components/ui";
import { fileApi } from "@/lib/api/files";
import { formatBytes } from "@/lib/download";
import type { StoredFile } from "@/types/file";
import { DemoPage, DemoSection } from "../_shared/Demo";

export default function FileUploadDemo() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [limits, setLimits] = useState<{ maxSizeMB: number; maxFiles: number } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const dialog = useDialog();
  const toast = useToast();

  useEffect(() => {
    fileApi.config().then(setLimits).catch(() => undefined);
  }, []);
  useEffect(() => {
    let cancelled = false;
    fileApi
      .list()
      .then((list) => !cancelled && setFiles(list))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const remove = async (f: StoredFile) => {
    if (!(await dialog.confirm(`'${f.name}' 파일을 삭제하시겠습니까?`, { title: "파일 삭제", okText: "삭제", danger: true }))) return;
    try {
      await fileApi.remove(f.id);
      toast.success("파일을 삭제했습니다.");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <DemoPage
      title="FileUpload"
      description="끌어다 놓거나 클릭해서 파일을 고릅니다. 형식·크기·개수를 올리기 전에 미리 검사하고, 업로드 진행률을 보여줍니다. 파일은 API 서버(uploads/ 폴더)에 저장됩니다."
    >
      <DemoSection
        title="여러 파일 (선택 후 업로드 버튼)"
        description={limits ? `서버 제한: 파일당 ${limits.maxSizeMB}MB, 한 번에 ${limits.maxFiles}개 (.env 의 UPLOAD_MAX_SIZE_MB, UPLOAD_MAX_FILES)` : undefined}
        code={`<FileUpload label="첨부파일" maxSize={10 * 1024 * 1024} maxFiles={10}
  upload={(files, onProgress) => fileApi.upload(files, onProgress)} onUploaded={reload} />`}
      >
        <FileUpload
          label="첨부파일"
          maxSize={(limits?.maxSizeMB ?? 10) * 1024 * 1024}
          maxFiles={limits?.maxFiles ?? 10}
          upload={(list, onProgress) => fileApi.upload(list, onProgress)}
          onUploaded={reload}
        />
      </DemoSection>

      <DemoSection
        title="버튼 모양"
        description="공간이 좁은 곳(폼 한 줄, 표 위 도구 막대 등)에 씁니다. 검사·목록·진행률은 영역 모양과 같습니다."
        code={`<FileUpload variant="button" buttonLabel="첨부파일 추가" upload={...} />

// 고르면 바로 업로드 (버튼에 진행률 표시)
<FileUpload variant="button" autoUpload buttonVariant="primary" buttonLabel="엑셀 업로드" accept=".xlsx,.xls,.csv" multiple={false} upload={...} />`}
      >
        <div className="flex flex-col gap-5">
          <FileUpload
            variant="button"
            label="첨부파일"
            buttonLabel="첨부파일 추가"
            maxSize={(limits?.maxSizeMB ?? 10) * 1024 * 1024}
            maxFiles={limits?.maxFiles ?? 10}
            upload={(list, onProgress) => fileApi.upload(list, onProgress)}
            onUploaded={reload}
          />
          <FileUpload
            variant="button"
            autoUpload
            buttonVariant="primary"
            buttonLabel="엑셀 업로드"
            accept=".xlsx,.xls,.csv"
            multiple={false}
            maxSize={(limits?.maxSizeMB ?? 10) * 1024 * 1024}
            upload={(list, onProgress) => fileApi.upload(list, onProgress)}
            onUploaded={() => {
              toast.success("엑셀 파일을 업로드했습니다.");
              reload();
            }}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="이미지 1개 (고르면 바로 업로드)"
        code={`<FileUpload accept="image/*" multiple={false} maxSize={2 * 1024 * 1024} autoUpload upload={...} />`}
      >
        <FileUpload
          label="대표 이미지"
          accept="image/*"
          multiple={false}
          maxSize={2 * 1024 * 1024}
          autoUpload
          upload={(list, onProgress) => fileApi.upload(list, onProgress)}
          onUploaded={reload}
        />
      </DemoSection>

      <DemoSection title={`업로드된 파일 (${files.length})`} description="파일 다운로드 컴포넌트(DownloadButton)로 받을 수 있습니다.">
        {files.length === 0 ? (
          <p className="text-sm text-gray-500">아직 업로드된 파일이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
            {files.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-gray-800" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(f.size)} · {new Date(f.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <DownloadButton size="sm" download={(onProgress) => fileApi.download(f.id, f.name, onProgress)} />
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(f)}>
                  삭제
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DemoSection>
    </DemoPage>
  );
}
