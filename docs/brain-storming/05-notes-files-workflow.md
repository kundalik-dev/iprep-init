---
name: Notes and files workflow plan
description: Product, storage, UI, and API plan for iPrep Notes & Files.
---

# Notes And Files Workflow Plan

This document defines the planned Notes & Files experience for iPrep. It explains how users upload, organize, convert, edit, and select preparation material as AI context for interviews, coaching, onboarding, and analysis.

It builds on:

- [`00-iprep-main-pages.md`](./00-iprep-main-pages.md)
- [`01-iprep-onboarding-and-first-interview.md`](./01-iprep-onboarding-and-first-interview.md)
- [`02-iprep-system-design-and-wrokflow.md`](./02-iprep-system-design-and-wrokflow.md)
- [`04-frontend-first-visit-onboarding-plan.md`](./04-frontend-first-visit-onboarding-plan.md)
- [`api-requirements.md`](./api-requirements.md)
- [`../demo-app/codex-iprep-html/index.html`](../demo-app/codex-iprep-html/index.html)

## Product Goal

Notes & Files is the local document workspace for interview preparation context.

Users should be able to:

- Upload resumes, notes, job descriptions, PDFs, DOCX files, and Markdown files.
- Store those files inside the local `.iprep` workspace created during onboarding.
- Organize files into folders.
- Convert supported uploaded documents into Markdown.
- View original files when preview support exists.
- Edit Markdown notes directly in the iPrep UI.
- Select one or more documents as context for interviews and AI Coach conversations.
- Ask AI to improve notes, summarize material, identify missing topics, or prepare focused interview context.

The first version should prioritize reliable local storage, Markdown editing, and context selection. Advanced retrieval, Git repository cloning, and semantic search can come later.

## User Value

The Notes & Files page gives the AI clean, user-approved preparation context. This avoids forcing the user to paste the same resume, notes, or topic list into every interview.

Primary use cases:

| Use case                | Description                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Resume context          | Upload a resume during onboarding or later, convert it to Markdown, and reuse it in interviews.     |
| Preparation notes       | Create or upload Markdown notes for topics, projects, STAR stories, system design, or DSA patterns. |
| Job-specific context    | Upload job descriptions or role notes and attach them to a targeted interview.                      |
| AI coaching context     | Let AI Coach read selected notes when answering questions or generating a preparation roadmap.      |
| Interview setup context | Select documents while creating an interview so questions and feedback are personalized.            |

## First-Version Scope

Supported file types:

| Extension | Stored as original | Editable in UI | AI context source              |
| --------- | ------------------ | -------------- | ------------------------------ |
| `.md`     | Yes                | Yes            | Directly from Markdown content |
| `.pdf`    | Yes                | No             | Converted `content.md`         |
| `.docx`   | Yes                | No             | Converted `content.md`         |

For the first version, AI context should always come from Markdown. If a PDF or DOCX has not been converted yet, the UI should make that status visible and prompt the user to convert it before using it as context.

Non-goals for the first version:

- Cloud document sync
- Public sharing links
- Collaborative editing
- Full Git repository browsing
- Vector database retrieval
- Real-time file system watching

## Local Storage Model

The CLI onboarding flow creates the local `.iprep` workspace. Notes & Files should store user documents under:

```text
~/.iprep/docs/<document-id>/
|-- original.<ext>
|-- content.md
`-- metadata.json
```

File responsibilities:

| File             | Purpose                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `original.<ext>` | The original uploaded file. For Markdown notes created in the UI, this may be omitted or mirror `content.md`.   |
| `content.md`     | The Markdown version used for AI context, preview, editing, and export.                                         |
| `metadata.json`  | Document title, type, tags, folder reference, upload source, conversion status, timestamps, and parsing errors. |

The local SQLite database should store searchable metadata, relationships, and document references. The file system should store the original and Markdown content. The database record and file folder must use the same `documentId`.

## Document Metadata

Recommended document metadata:

```json
{
  "id": "doc_resume_001",
  "title": "resume.pdf",
  "type": "pdf",
  "folderId": null,
  "tags": ["resume", "onboarding"],
  "originalPath": "~/.iprep/docs/doc_resume_001/original.pdf",
  "markdownPath": "~/.iprep/docs/doc_resume_001/content.md",
  "conversionStatus": "completed",
  "source": "upload",
  "createdAt": "2026-05-11T10:00:00.000Z",
  "updatedAt": "2026-05-11T10:00:00.000Z"
}
```

Recommended conversion statuses:

| Status         | Meaning                                                 |
| -------------- | ------------------------------------------------------- |
| `not_required` | Markdown was created directly or uploaded as `.md`.     |
| `queued`       | Conversion has been requested but has not started.      |
| `processing`   | The server is converting the original file to Markdown. |
| `completed`    | `content.md` is ready for AI context.                   |
| `failed`       | Conversion failed; show the error and allow retry.      |

## Folder Model

Folders are organizational metadata for documents. They do not need to mirror physical nested folders in the first version.

Recommended behavior:

- A document can belong to zero or one folder.
- A folder can contain many documents.
- Root-level documents are allowed.
- Deleting a folder should either move contained documents to root or require explicit confirmation to delete everything inside. The safer first-version behavior is to move documents to root.
- Folder names should be unique among sibling folders if nested folders are later supported.

First-version folder fields:

```json
{
  "id": "folder_001",
  "name": "Behavioral Prep",
  "parentFolderId": null,
  "createdAt": "2026-05-11T10:00:00.000Z",
  "updatedAt": "2026-05-11T10:00:00.000Z"
}
```

## Conversion Workflow

The server should own document conversion because the hosted frontend cannot safely access local files directly.

Expected upload and conversion flow:

1. User uploads a `.md`, `.pdf`, or `.docx` file from the Notes & Files page or onboarding goal page.
2. Frontend sends the file to `POST /api/v1/documents/upload`.
3. Server stores the original file under `~/.iprep/docs/<document-id>/`.
4. If the file is Markdown, server writes or copies it to `content.md` and marks conversion as `not_required`.
5. If the file is PDF or DOCX and `convertToMarkdown` is true, server queues conversion.
6. Conversion uses MarkItDown or the selected conversion adapter to generate `content.md`.
7. Server updates document metadata and database state.
8. Frontend refreshes the selected document and enables AI context selection after conversion succeeds.

The existing Streamlit MarkItDown tool can be treated as an early external conversion helper. The target product direction should be a server-side conversion flow exposed through the local API.

## Notes & Files UI

The prototype in `docs/demo-app/codex-iprep-html` uses a two-panel Files view. The real frontend should keep the same basic shape:

- Top app bar with actions: `New File`, `New Folder`, and `Upload`.
- Left file tree attached to the route content area.
- Folder rows that expand and collapse.
- File rows that select the active document.
- Main editor or viewer panel for the selected document.

Recommended first-version layout:

| Area             | Behavior                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Header           | Shows page title, search field, and document actions.                                      |
| Tree panel       | Shows folders, root files, selected file, conversion status, and empty state.              |
| Detail panel     | Shows preview, editor, metadata, and document-specific actions.                            |
| Upload modal     | Accepts `.md`, `.pdf`, `.docx`, optional folder, optional tags, and conversion preference. |
| New file modal   | Creates a Markdown note and opens it in edit mode.                                         |
| New folder modal | Creates a folder and expands it immediately.                                               |

## Markdown Editing

Markdown files should support two modes:

- Preview mode by default for reading.
- Edit mode for modifying `content.md`.

Expected edit actions:

- Open selected Markdown file.
- Switch between preview and edit.
- Save changes manually.
- Show unsaved, saving, saved, and failed states.
- Preserve content if save fails.
- Update `updatedAt` after a successful save.

Autosave is useful but should not be required for the first server-backed version. A visible `Save` action is safer until conflict and failure handling are finalized.

PDF and DOCX behavior:

- Original file can be shown as metadata first.
- PDF preview can be added with PDF.js later.
- DOCX preview can be added later if needed.
- AI context should use `content.md`, not the original binary document.

## AI Context Selection

Documents become useful when they can be attached to workflows.

Supported context attachment points:

| Workflow                      | Field                                                 |
| ----------------------------- | ----------------------------------------------------- |
| Ready-made interview creation | `contextDocumentIds`                                  |
| AI-guided interview setup     | `contextDocumentIds` inferred or selected during chat |
| AI Coach message              | `contextDocumentIds`                                  |
| Onboarding goal step          | `resumeDocumentId`                                    |

Context rules:

- Only documents with usable Markdown should be available as AI context.
- If the selected document is PDF or DOCX and conversion is incomplete, show a conversion prompt.
- Resume documents should be taggable as `resume`.
- The app should allow users to select multiple context documents for one interview.
- The server should validate that every `contextDocumentId` exists locally before creating an interview or sending an AI Coach message.

## API Contract

The canonical API surface is documented in [`api-requirements.md`](./api-requirements.md). Notes & Files should use these endpoints:

| Method   | Endpoint                                  | Purpose                                             |
| -------- | ----------------------------------------- | --------------------------------------------------- |
| `GET`    | `/api/v1/documents`                       | List uploaded documents and Markdown notes.         |
| `POST`   | `/api/v1/documents`                       | Create a Markdown note.                             |
| `POST`   | `/api/v1/documents/upload`                | Upload resume, notes, PDF, DOCX, or Markdown.       |
| `GET`    | `/api/v1/documents/{documentId}`          | Read document metadata and Markdown content.        |
| `PATCH`  | `/api/v1/documents/{documentId}`          | Update title, tags, folder, or Markdown content.    |
| `DELETE` | `/api/v1/documents/{documentId}`          | Delete a document.                                  |
| `POST`   | `/api/v1/documents/{documentId}/convert`  | Convert original file to Markdown.                  |
| `POST`   | `/api/v1/documents/{documentId}/optimize` | Ask AI to improve notes or identify missing topics. |
| `GET`    | `/api/v1/documents/{documentId}/download` | Download the original or Markdown document.         |
| `GET`    | `/api/v1/folders`                         | List document folders.                              |
| `POST`   | `/api/v1/folders`                         | Create a folder.                                    |
| `PATCH`  | `/api/v1/folders/{folderId}`              | Rename or move a folder.                            |
| `DELETE` | `/api/v1/folders/{folderId}`              | Delete a folder.                                    |

Recommended list query parameters:

| Param              | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| `folderId`         | Filter documents by folder.                             |
| `q`                | Search by title, tags, and Markdown content if indexed. |
| `type`             | Filter by `md`, `pdf`, or `docx`.                       |
| `tag`              | Filter by tag such as `resume` or `onboarding`.         |
| `page`, `pageSize` | Paginate larger document libraries.                     |

Recommended `PATCH /api/v1/documents/{documentId}` request:

```json
{
  "title": "Behavioral prep notes",
  "folderId": "folder_001",
  "tags": ["behavioral", "star"],
  "contentMarkdown": "# STAR Stories\n\n..."
}
```

## Error Handling

The UI should handle these cases explicitly:

| State                       | UI behavior                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| Local server offline        | Show the local connection screen and ask the user to run `iprep start`.  |
| Upload rejected             | Show supported file types and keep the upload modal open.                |
| File too large              | Explain the limit and allow the user to choose another file.             |
| Conversion failed           | Show retry action and preserve the original file.                        |
| Save failed                 | Keep the edited Markdown in the editor and show retry.                   |
| Document missing            | Return to the file list and refresh local state.                         |
| Folder delete has documents | Move documents to root or require confirmation before deleting contents. |

## Future Git Repository Workflow

A future version should allow users to clone a Git repository into the iPrep document workspace and switch between repository contexts, similar to switching projects.

Possible CLI shape:

```bash
iprep docs clone <repo-url> --name <workspace-name> --branch <branch-name>
```

Future behavior:

- Clone the repository into a controlled folder under `.iprep`.
- Store repository metadata such as name, remote URL, branch, local path, and last sync time.
- Show the cloned repository in Notes & Files as a separate workspace or top-level source.
- Let users switch between normal notes and repository-backed documents.
- Support manual sync first; real-time sync can come later.
- Avoid exposing files outside the `.iprep` workspace through the hosted frontend.

This should be treated as a later project because it requires stronger file access rules, Git error handling, repository size limits, branch management, and safe syncing.

## Future AI Retrieval

Semantic search can be added after the basic document workflow is stable.

Future capabilities:

- Chunk Markdown documents.
- Store embeddings in ChromaDB or another local vector database.
- Retrieve relevant chunks for AI Coach and interview setup.
- Show which notes were used in an AI response.
- Re-index documents after edits or conversion.

The first version should keep context selection explicit. Automatic retrieval should be introduced only after users can inspect and control which local documents are used.

## Implementation Order

1. Implement document and folder database models if missing.
2. Add local path helpers for `~/.iprep/docs/<document-id>/`.
3. Implement `POST /api/v1/documents/upload` for `.md`, `.pdf`, and `.docx`.
4. Implement Markdown note creation with `POST /api/v1/documents`.
5. Implement document list, read, update, delete, and download endpoints.
6. Implement folder list, create, rename, move, and delete endpoints.
7. Build the two-panel Notes & Files UI.
8. Add Markdown preview/edit/save flow.
9. Add conversion status display and retry action.
10. Wire document context selection into onboarding, New Interview, and AI Coach.

## Open Questions

1. Should physical folders mirror UI folders, or should folders remain database-only metadata for the first version?
2. What file size limit should uploads enforce?
3. Should conversion run synchronously for small files or always use a background job?
4. Should Markdown edits update only `content.md`, or also update `original.md` for Markdown-origin documents?
5. Should folder deletion move documents to root by default or ask the user to choose between move and delete?
