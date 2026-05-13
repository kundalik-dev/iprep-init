import fs from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from 'express';
import { DocumentQuery } from '@iprep/db';
import { IprepPaths } from '@iprep/shared';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';

const SUPPORTED_UPLOAD_EXTENSIONS = new Set(['.md', '.pdf', '.docx']);

function mapDocument(document: Awaited<ReturnType<typeof DocumentQuery.createDocument>>) {
  return {
    id: document.id,
    title: document.title,
    type: path.extname(document.title).replace('.', '') || 'md',
    originalPath: document.fileUrl,
    markdownPath: document.content ? document.fileUrl : null,
    conversionStatus: document.content ? 'completed' : 'queued',
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export const listDocuments: RequestHandler = asyncHandler(async (_req, res) => {
  const documents = await DocumentQuery.listDocuments();

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      documents.map((document) => mapDocument(document)),
      'Documents fetched successfully',
    ),
  );
});

export const uploadDocument: RequestHandler = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'file is required');
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!SUPPORTED_UPLOAD_EXTENSIONS.has(extension)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'unsupported file type',
      [`supported extensions: ${[...SUPPORTED_UPLOAD_EXTENSIONS].join(', ')}`],
    );
  }

  const initialDocument = await DocumentQuery.createDocument({
    title: file.originalname,
    content: extension === '.md' ? file.buffer.toString('utf8') : null,
  });

  const documentDir = path.join(IprepPaths.root, 'docs', initialDocument.id);
  await fs.mkdir(documentDir, { recursive: true });

  const originalPath = path.join(documentDir, `original${extension}`);
  await fs.writeFile(originalPath, file.buffer);

  const document = await DocumentQuery.updateDocumentFileUrl(initialDocument.id, originalPath);

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      mapDocument(document),
      'Document uploaded successfully',
    ),
  );
});
