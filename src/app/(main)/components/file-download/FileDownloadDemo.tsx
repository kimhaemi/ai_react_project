"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DownloadButton } from "@/components/ui";
import { fileApi } from "@/lib/api/files";
import { downloadCsv, formatBytes, saveBlob } from "@/lib/download";
import type { StoredFile } from "@/types/file";
import { DemoPage, DemoSection } from "../_shared/Demo";

const SAMPLE = [
  ["번호", "제목", "작성자", "조회수"],
  [3, "11월 정기 점검 안내", "관리자", 1820],
  [2, "신규 기능: 파일 첨부", "운영팀", 1240],
  [1, "공지사항 게시판 오픈 안내", "관리자", 860],
];

export default function FileDownloadDemo() {
  const [files, setFiles] = useState<StoredFile[]>([]);

  useEffect(() => {
    fileApi.list().then(setFiles).catch(() => undefined);
  }, []);

  return (
    <DemoPage
      title="File download"
      description="서버 파일 다운로드(진행률 표시), 화면 데이터를 CSV/텍스트로 저장하는 방법입니다."
    >
      <DemoSection
        title="서버 파일 받기"
        description="DownloadButton 은 받는 동안 진행률을 보여주고 중복 클릭을 막습니다. 파일 이름은 서버가 보낸 원래 이름(한글 포함)으로 저장됩니다."
        code={`<DownloadButton download={(onProgress) => fileApi.download(file.id, file.name, onProgress)} />

// 진행률이 필요 없으면 일반 링크도 가능
<a href={fileApi.downloadUrl(file.id)} download>받기</a>`}
      >
        {files.length === 0 ? (
          <p className="text-sm text-gray-500">
            받을 파일이 없습니다.{" "}
            <Link href="/components/file-upload" className="text-blue-600 hover:underline">
              파일 업로드
            </Link>
            에서 먼저 올려 주세요.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
            {files.slice(0, 5).map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate" title={f.name}>
                  {f.name} <span className="text-xs text-gray-500">({formatBytes(f.size)})</span>
                </span>
                <DownloadButton size="sm" download={(onProgress) => fileApi.download(f.id, f.name, onProgress)} />
                <a href={fileApi.downloadUrl(f.id)} download className="text-xs text-blue-600 hover:underline">
                  링크로 받기
                </a>
              </li>
            ))}
          </ul>
        )}
      </DemoSection>

      <DemoSection
        title="화면 데이터 저장"
        description="CSV 는 엑셀에서 한글이 깨지지 않도록 저장하고, 수식으로 실행될 수 있는 값은 막습니다."
        code={`downloadCsv("공지사항", rows);                       // 2차원 배열 → CSV
saveBlob(new Blob([text], { type: "text/plain" }), "memo.txt");  // 아무 Blob 이나 저장`}
      >
        <div className="flex flex-wrap gap-2">
          <DownloadButton download={() => downloadCsv("공지사항-목록", SAMPLE)}>CSV 저장</DownloadButton>
          <DownloadButton
            download={() =>
              saveBlob(new Blob([JSON.stringify(SAMPLE, null, 2)], { type: "application/json" }), "공지사항-목록.json")
            }
          >
            JSON 저장
          </DownloadButton>
          <DownloadButton
            download={() => saveBlob(new Blob([`저장 시각: ${new Date().toLocaleString()}\n`], { type: "text/plain;charset=utf-8" }), "memo.txt")}
          >
            텍스트 저장
          </DownloadButton>
        </div>
      </DemoSection>
    </DemoPage>
  );
}
