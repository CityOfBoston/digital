export interface UploadPayload<FileType> {
  type: string;
  uploadSessionId: string;
  label?: string;
  file: FileType;
}

export type UploadResponse = {
  attachmentKey: string;
  filename: string;
};
