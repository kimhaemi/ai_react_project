import type { StoredFile } from "@/types/file";
import { fileNameFromDisposition, saveBlob } from "@/lib/download";
import { api } from "./client";

type Progress = (percent: number) => void;

export const fileApi = {
  config: () => api.get<{ maxSizeMB: number; maxFiles: number }>("/files/config").then((r) => r.data),
  list: () => api.get<StoredFile[]>("/files").then((r) => r.data),

  /** 업로드 (진행률 0~100 콜백) */
  upload: (files: File[], onProgress?: Progress) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return api
      .post<StoredFile[]>("/files", form, {
        // FormData 는 브라우저가 boundary 를 붙여야 하므로 Content-Type 을 직접 지정하지 않음
        headers: { "Content-Type": undefined },
        timeout: 0,
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      })
      .then((r) => r.data);
  },

  remove: (id: string) => api.delete<{ deleted: number }>(`/files/${id}`).then((r) => r.data),

  /** 일반 링크로 받을 때 쓰는 주소 */
  downloadUrl: (id: string) => `${api.defaults.baseURL}/files/${id}/download`,

  /** axios 로 받아서 저장 (진행률 표시 가능) */
  download: async (id: string, fallbackName: string, onProgress?: Progress) => {
    const res = await api.get<Blob>(`/files/${id}/download`, {
      responseType: "blob",
      timeout: 0,
      onDownloadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
    const name = fileNameFromDisposition(res.headers["content-disposition"] as string | undefined) ?? fallbackName;
    saveBlob(res.data, name);
  },
};
