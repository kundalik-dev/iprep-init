import fs from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from 'express';
import { DocumentQuery } from '@iprep/db';
import { IprepPaths } from '@iprep/shared';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';

const SUPPORTED_UPLOAD_EXTENSIONS = new Set(['.md', '.pdf', '.docx']);
const FOLDERS_FILE = 'folders.json';

type StoredMetadata = {
  folderId?: string | null;
  tags?: string[];
  conversionStatus?: 'not_required' | 'queued' | 'processing' | 'completed' | 'failed';
  markdownPath?: string | null;
};

type StoredFolder = {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbDocument = Awaited<ReturnType<typeof DocumentQuery.createDocument>>;

function documentDir(documentId: string) {
  return path.join(IprepPaths.root, 'docs', documentId);
}

function metadataPath(documentId: string) {
  return path.join(documentDir(documentId), 'metadata.json');
}

async function ensureDocsDir() {
  const docsDir = path.join(IprepPaths.root, 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  return docsDir;
}

async function readMetadata(documentId: string): Promise<StoredMetadata> {
  try {
    const raw = await fs.readFile(metadataPath(documentId), 'utf8');
    return JSON.parse(raw) as StoredMetadata;
  } catch {
    return {};
  }
}

async function writeMetadata(documentId: string, metadata: StoredMetadata) {
  await fs.mkdir(documentDir(documentId), { recursive: true });
  await fs.writeFile(metadataPath(documentId), `${JSON.stringify(metadata, null, 2)}\n`);
}

async function mapDocument(document: DbDocument, includeContent = false) {
  const extension = path.extname(document.title).replace('.', '').toLowerCase() || 'md';
  const metadata = await readMetadata(document.id);
  const type = ['md', 'pdf', 'docx'].includes(extension) ? extension : 'md';
  const markdownPath = metadata.markdownPath ?? path.join(documentDir(document.id), 'content.md');
  const hasMarkdown = Boolean(document.content);

  return {
    id: document.id,
    title: document.title,
    type,
    folderId: metadata.folderId ?? null,
    tags: metadata.tags ?? [],
    originalPath: document.fileUrl,
    markdownPath: hasMarkdown ? markdownPath : null,
    conversionStatus:
      metadata.conversionStatus ?? (type === 'md' ? 'not_required' : hasMarkdown ? 'completed' : 'queued'),
    ...(includeContent ? { contentMarkdown: document.content ?? '' } : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

async function readFolders(): Promise<StoredFolder[]> {
  const docsDir = await ensureDocsDir();

  try {
    const raw = await fs.readFile(path.join(docsDir, FOLDERS_FILE), 'utf8');
    return JSON.parse(raw) as StoredFolder[];
  } catch {
    return [];
  }
}

async function writeFolders(folders: StoredFolder[]) {
  const docsDir = await ensureDocsDir();
  await fs.writeFile(path.join(docsDir, FOLDERS_FILE), `${JSON.stringify(folders, null, 2)}\n`);
}

export const listDocuments: RequestHandler = asyncHandler(async (_req, res) => {
  const documents = await DocumentQuery.listDocuments();
  const mappedDocuments = await Promise.all(documents.map((document) => mapDocument(document)));

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, mappedDocuments, 'Documents fetched successfully'));
});

export const createDocument: RequestHandler = asyncHandler(async (req, res) => {
  const title = String(req.body?.title ?? '').trim();
  const contentMarkdown = String(req.body?.contentMarkdown ?? '');
  const folderId = req.body?.folderId ? String(req.body.folderId) : null;

  if (!title) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'title is required');
  }

  const document = await DocumentQuery.createDocument({
    title: title.endsWith('.md') ? title : `${title}.md`,
    content: contentMarkdown,
  });
  const markdownPath = path.join(documentDir(document.id), 'content.md');

  await fs.mkdir(documentDir(document.id), { recursive: true });
  await fs.writeFile(markdownPath, contentMarkdown);
  await writeMetadata(document.id, {
    folderId,
    tags: req.body?.tags ?? [],
    conversionStatus: 'not_required',
    markdownPath,
  });

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, await mapDocument(document, true), 'Document created successfully'));
});

export const uploadDocument: RequestHandler = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'file is required');
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!SUPPORTED_UPLOAD_EXTENSIONS.has(extension)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'unsupported file type', [
      `supported extensions: ${[...SUPPORTED_UPLOAD_EXTENSIONS].join(', ')}`,
    ]);
  }

  const isMarkdown = extension === '.md';
  const content = isMarkdown ? file.buffer.toString('utf8') : null;
  const initialDocument = await DocumentQuery.createDocument({
    title: file.originalname,
    content,
  });

  await fs.mkdir(documentDir(initialDocument.id), { recursive: true });

  const originalPath = path.join(documentDir(initialDocument.id), `original${extension}`);
  const markdownPath = path.join(documentDir(initialDocument.id), 'content.md');

  await fs.writeFile(originalPath, file.buffer);
  if (content !== null) {
    await fs.writeFile(markdownPath, content);
  }

  await writeMetadata(initialDocument.id, {
    folderId: req.body?.folderId ? String(req.body.folderId) : null,
    tags: req.body?.tags ? String(req.body.tags).split(',').map((tag) => tag.trim()).filter(Boolean) : [],
    conversionStatus: isMarkdown ? 'not_required' : 'queued',
    markdownPath: content !== null ? markdownPath : null,
  });

  const document = await DocumentQuery.updateDocumentFileUrl(initialDocument.id, originalPath);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, await mapDocument(document, true), 'Document uploaded successfully'));
});

export const getDocument: RequestHandler = asyncHandler(async (req, res) => {
  const documentId = String(req.params.documentId);
  const document = await DocumentQuery.getDocument(documentId);

  if (!document) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'document not found');
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, await mapDocument(document, true), 'Document fetched successfully'));
});

export const updateDocument: RequestHandler = asyncHandler(async (req, res) => {
  const documentId = String(req.params.documentId);
  const currentDocument = await DocumentQuery.getDocument(documentId);

  if (!currentDocument) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'document not found');
  }

  const metadata = await readMetadata(currentDocument.id);
  const nextContent =
    req.body?.contentMarkdown !== undefined ? String(req.body.contentMarkdown) : currentDocument.content;
  const nextTitle =
    req.body?.title !== undefined ? String(req.body.title).trim() || currentDocument.title : currentDocument.title;
  const markdownPath = metadata.markdownPath ?? path.join(documentDir(currentDocument.id), 'content.md');

  if (req.body?.contentMarkdown !== undefined) {
    await fs.mkdir(documentDir(currentDocument.id), { recursive: true });
    await fs.writeFile(markdownPath, String(req.body.contentMarkdown));
  }

  await writeMetadata(currentDocument.id, {
    ...metadata,
    folderId: req.body?.folderId !== undefined ? req.body.folderId : metadata.folderId ?? null,
    tags: Array.isArray(req.body?.tags) ? req.body.tags : metadata.tags ?? [],
    markdownPath: nextContent ? markdownPath : metadata.markdownPath ?? null,
    conversionStatus: metadata.conversionStatus ?? 'not_required',
  });

  const document = await DocumentQuery.updateDocument(currentDocument.id, {
    title: nextTitle,
    content: nextContent,
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, await mapDocument(document, true), 'Document updated successfully'));
});

export const deleteDocument: RequestHandler = asyncHandler(async (req, res) => {
  const documentId = String(req.params.documentId);
  const document = await DocumentQuery.deleteDocument(documentId);

  await fs.rm(documentDir(document.id), { recursive: true, force: true });

  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { id: document.id }, 'Document deleted'));
});

export const convertDocument: RequestHandler = asyncHandler(async (req, res) => {
  const documentId = String(req.params.documentId);
  const currentDocument = await DocumentQuery.getDocument(documentId);

  if (!currentDocument) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'document not found');
  }

  const metadata = await readMetadata(currentDocument.id);
  const markdownPath = path.join(documentDir(currentDocument.id), 'content.md');
  const fallbackContent = `# ${currentDocument.title}\n\nConversion is queued. Replace this placeholder with Markdown generated from the original file.`;

  await fs.mkdir(documentDir(currentDocument.id), { recursive: true });
  await fs.writeFile(markdownPath, currentDocument.content ?? fallbackContent);
  await writeMetadata(currentDocument.id, {
    ...metadata,
    markdownPath,
    conversionStatus: currentDocument.content ? 'completed' : 'queued',
  });

  const document = currentDocument.content
    ? currentDocument
    : await DocumentQuery.updateDocument(currentDocument.id, { content: fallbackContent });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, await mapDocument(document, true), 'Document conversion updated'));
});

export const listFolders: RequestHandler = asyncHandler(async (_req, res) => {
  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, await readFolders(), 'Folders fetched'));
});

export const createFolder: RequestHandler = asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? '').trim();

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'folder name is required');
  }

  const now = new Date().toISOString();
  const folder: StoredFolder = {
    id: `folder_${Date.now()}`,
    name,
    parentFolderId: null,
    createdAt: now,
    updatedAt: now,
  };
  const folders = await readFolders();
  await writeFolders([...folders, folder]);

  res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, folder, 'Folder created'));
});

export const updateFolder: RequestHandler = asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const folderId = String(req.params.folderId);

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'folder name is required');
  }

  const folders = await readFolders();
  const folder = folders.find((item) => item.id === folderId);

  if (!folder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'folder not found');
  }

  folder.name = name;
  folder.updatedAt = new Date().toISOString();
  await writeFolders(folders);

  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, folder, 'Folder updated'));
});

export const deleteFolder: RequestHandler = asyncHandler(async (req, res) => {
  const folderId = String(req.params.folderId);
  const folders = await readFolders();
  const nextFolders = folders.filter((folder) => folder.id !== folderId);

  if (nextFolders.length === folders.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'folder not found');
  }

  await writeFolders(nextFolders);

  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { id: folderId }, 'Folder deleted'));
});
