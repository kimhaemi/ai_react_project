export interface Notice {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeInput {
  title: string;
  author: string;
  content: string;
}
