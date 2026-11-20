export interface StoredFile {
  id: string;
  /** 원래 파일 이름 */
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}
