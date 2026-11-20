"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, DownloadButton, FileUpload } from "@/components/ui";
import { fileApi } from "@/lib/api/files";
import { formatBytes } from "@/lib/download";
import type { StoredFile } from "@/types/file";
import { DemoPage, DemoSection } from "../_shared/Demo";

export default function FileUploadDemo() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [limits, setLimits] = useState<{ maxSizeMB: number; maxFiles: number } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

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
    if (!window.confirm(`'${f.name}' 파일을 삭제하시겠습니까?`)) return;
    try {
      await fileApi.remove(f.id);
      reload();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "삭제에 실패했습니다.");
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
