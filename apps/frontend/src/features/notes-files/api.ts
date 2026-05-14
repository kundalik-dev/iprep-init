import { apiRequest } from '@/lib/http';

export type DocumentType = 'md' | 'pdf' | 'docx';
export type ConversionStatus = 'not_required' | 'queued' | 'processing' | 'completed' | 'failed';

export type IprepDocument = {
  id: string;
  title: string;
  type: DocumentType;
  folderId: string | null;
  tags: string[];
  originalPath: string | null;
  markdownPath: string | null;
  conversionStatus: ConversionStatus;
  contentMarkdown?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IprepFolder = {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDocumentPayload = {
  title: string;
  folderId?: string | null;
  contentMarkdown: string;
};

export type UpdateDocumentPayload = {
  title?: string;
  folderId?: string | null;
  tags?: string[];
  contentMarkdown?: string;
};

export async function listDocuments() {
  return apiRequest<IprepDocument[]>('/documents');
}

export async function getDocument(documentId: string) {
  return apiRequest<IprepDocument>(`/documents/${documentId}`);
}

export async function createDocument(payload: CreateDocumentPayload) {
  return apiRequest<IprepDocument>('/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDocument(documentId: string, payload: UpdateDocumentPayload) {
  return apiRequest<IprepDocument>(`/documents/${documentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteDocument(documentId: string) {
  return apiRequest<{ id: string }>(`/documents/${documentId}`, {
    method: 'DELETE',
  });
}

export async function uploadDocument(file: File, folderId?: string | null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('convertToMarkdown', 'true');

  if (folderId) {
    formData.append('folderId', folderId);
  }

  return apiRequest<IprepDocument>('/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function convertDocument(documentId: string) {
  return apiRequest<IprepDocument>(`/documents/${documentId}/convert`, {
    method: 'POST',
  });
}

export async function listFolders() {
  return apiRequest<IprepFolder[]>('/folders');
}

export async function createFolder(name: string) {
  return apiRequest<IprepFolder>('/folders', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateFolder(folderId: string, name: string) {
  return apiRequest<IprepFolder>(`/folders/${folderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteFolder(folderId: string) {
  return apiRequest<{ id: string }>(`/folders/${folderId}`, {
    method: 'DELETE',
  });
}
