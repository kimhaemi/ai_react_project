import type { Notice, NoticeInput } from "@/types/notice";
import { api } from "./client";

export const noticeApi = {
  list: () => api.get<Notice[]>("/notices").then((r) => r.data),
  get: (id: number) => api.get<Notice>(`/notices/${id}`).then((r) => r.data),
  create: (input: NoticeInput) => api.post<Notice>("/notices", input).then((r) => r.data),
  update: (id: number, input: NoticeInput) => api.put<Notice>(`/notices/${id}`, input).then((r) => r.data),
  remove: (ids: number[]) => api.post<{ deleted: number }>("/notices/delete", { ids }).then((r) => r.data),
};
