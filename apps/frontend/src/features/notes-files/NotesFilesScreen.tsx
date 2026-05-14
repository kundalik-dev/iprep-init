import { useEffect, useMemo, useRef, useState } from 'react';
import GithubSlugger from 'github-slugger';
import {
  ChevronRight,
  Download,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
  convertDocument,
  createDocument,
  createFolder,
  deleteDocument,
  getDocument,
  listDocuments,
  listFolders,
  updateDocument,
  uploadDocument,
  type IprepDocument,
  type IprepFolder,
} from './api';

type EditorMode = 'preview' | 'edit';
type ModalState = 'new-file' | 'new-folder' | 'upload' | null;
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type TocItem = {
  id: string;
  depth: number;
  text: string;
};

export function NotesFilesScreen() {
  const [documents, setDocuments] = useState<IprepDocument[]>([]);
  const [folders, setFolders] = useState<IprepFolder[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<IprepDocument | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set());
  const [editorMode, setEditorMode] = useState<EditorMode>('preview');
  const [draftMarkdown, setDraftMarkdown] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [modal, setModal] = useState<ModalState>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshWorkspace(), 0);
    return () => window.clearTimeout(timer);
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedDocumentId) {
      return;
    }

    const timer = window.setTimeout(() => void loadDocument(selectedDocumentId), 0);
    return () => window.clearTimeout(timer);
  }, [selectedDocumentId]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return documents;
    }

    return documents.filter((document) => {
      const haystack = [document.title, document.type, document.conversionStatus, ...document.tags]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [documents, query]);

  const rootDocuments = filteredDocuments.filter((document) => !document.folderId);
  const documentsByFolder = new Map<string, IprepDocument[]>();

  for (const folder of folders) {
    documentsByFolder.set(
      folder.id,
      filteredDocuments.filter((document) => document.folderId === folder.id),
    );
  }

  async function refreshWorkspace() {
    setIsLoading(true);
    setError(null);

    try {
      const [nextDocuments, nextFolders] = await Promise.all([listDocuments(), listFolders()]);

      setDocuments(nextDocuments);
      setFolders(nextFolders);
      setExpandedFolders(new Set(nextFolders.map((folder) => folder.id)));

      if (!selectedDocumentId && nextDocuments.length > 0) {
        setSelectedDocumentId(nextDocuments[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Notes & Files.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDocument(documentId: string) {
    setError(null);

    try {
      const document = await getDocument(documentId);
      setSelectedDocument(document);
      setDraftMarkdown(document.contentMarkdown || '');
      setSaveState('idle');
      setEditorMode(document.type === 'md' ? 'preview' : 'preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open document.');
    }
  }

  async function handleCreateDocument(title: string, folderId: string | null) {
    setIsBusy(true);
    setError(null);

    try {
      const document = await createDocument({
        title: title.endsWith('.md') ? title : `${title}.md`,
        folderId,
        contentMarkdown: `# ${title.replace(/\.md$/i, '')}\n\n`,
      });

      setDocuments((current) => [document, ...current]);
      setSelectedDocumentId(document.id);
      setEditorMode('edit');
      if (folderId) {
        setExpandedFolders((current) => new Set(current).add(folderId));
      }
      setModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create note.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateFolder(name: string) {
    setIsBusy(true);
    setError(null);

    try {
      const folder = await createFolder(name);
      setFolders((current) => [...current, folder]);
      setExpandedFolders((current) => new Set(current).add(folder.id));
      setModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create folder.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUpload(file: File, folderId: string | null) {
    setIsBusy(true);
    setError(null);

    try {
      const document = await uploadDocument(file, folderId);
      setDocuments((current) => [document, ...current]);
      setSelectedDocumentId(document.id);
      if (folderId) {
        setExpandedFolders((current) => new Set(current).add(folderId));
      }
      setModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload file.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSave() {
    if (!selectedDocument || selectedDocument.type !== 'md') {
      return;
    }

    setSaveState('saving');
    setError(null);

    try {
      const document = await updateDocument(selectedDocument.id, {
        contentMarkdown: draftMarkdown,
      });

      setSelectedDocument({ ...document, contentMarkdown: draftMarkdown });
      setDocuments((current) =>
        current.map((item) => (item.id === document.id ? { ...item, ...document } : item)),
      );
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setError(err instanceof Error ? err.message : 'Unable to save note.');
    }
  }

  async function handleDeleteDocument(documentId: string) {
    setIsBusy(true);
    setError(null);

    try {
      await deleteDocument(documentId);
      const nextDocuments = documents.filter((document) => document.id !== documentId);
      setDocuments(nextDocuments);
      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(nextDocuments[0]?.id ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete document.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConvertDocument(documentId: string) {
    setIsBusy(true);
    setError(null);

    try {
      const document = await convertDocument(documentId);
      setDocuments((current) => current.map((item) => (item.id === document.id ? document : item)));
      setSelectedDocument(document);
      setDraftMarkdown(document.contentMarkdown || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to convert document.');
    } finally {
      setIsBusy(false);
    }
  }

  function toggleFolder(folderId: string) {
    setExpandedFolders((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }

  return (
    <div className="files-screen view-enter">
      <div className="files-topbar">
        <div className="files-titlebar">
          <Folder className="files-title-icon" size={24} fill="currentColor" stroke="currentColor" />
          <div className="page-title">Files</div>
        </div>
        <div className="files-topbar-actions">
          <div className="files-search">
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes"
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setModal('new-file')}>
            <Plus size={14} /> New File
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setModal('new-folder')}>
            <Plus size={14} /> New Folder
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('upload')}>
            <Upload size={14} /> Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="files-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="files-layout">
        <aside className="file-tree">
          <div className="file-tree-header">
            <span className="file-tree-title">Files</span>
            <div className="file-tree-actions">
              <button
                className="tree-action-btn"
                onClick={() => void refreshWorkspace()}
                title="Refresh"
                aria-label="Refresh files"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
          <div className="file-tree-body">
            {isLoading ? (
              <TreeLoading />
            ) : documents.length === 0 ? (
              <div className="files-tree-empty">No notes yet</div>
            ) : (
              <>
                {folders.map((folder) => (
                  <div className="tree-folder" key={folder.id}>
                    <button
                      className={cn('tree-folder-row', expandedFolders.has(folder.id) && 'open')}
                      onClick={() => toggleFolder(folder.id)}
                    >
                      <ChevronRight className="tree-chevron" size={13} />
                      {expandedFolders.has(folder.id) ? (
                        <FolderOpen className="tree-folder-icon" size={16} fill="#ffc107" stroke="#ffc107" />
                      ) : (
                        <Folder className="tree-folder-icon" size={16} fill="#ffc107" stroke="#ffc107" />
                      )}
                      <span className="tree-folder-name">{folder.name}</span>
                      <span className="tree-folder-count">
                        {documentsByFolder.get(folder.id)?.length ?? 0}
                      </span>
                    </button>
                    <div className="tree-files">
                      {(documentsByFolder.get(folder.id) ?? []).map((document) => (
                        <DocumentTreeRow
                          key={document.id}
                          document={document}
                          isSelected={selectedDocumentId === document.id}
                          onSelect={() => setSelectedDocumentId(document.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {rootDocuments.length > 0 && (
                  <div className="tree-root-group">
                    <div className="tree-root-label">Root</div>
                    {rootDocuments.map((document) => (
                      <DocumentTreeRow
                        key={document.id}
                        document={document}
                        isSelected={selectedDocumentId === document.id}
                        onSelect={() => setSelectedDocumentId(document.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="tree-storage-info">Stored locally in ~/.iprep/docs</div>
        </aside>

        <section className="editor-area">
          {selectedDocument ? (
            <>
              <div className="editor-toolbar">
                <div className="editor-file-heading">
                  <FileText size={16} className="editor-file-icon" />
                  <div className="editor-filename">{selectedDocument.title}</div>
                  {selectedDocument.type !== 'md' && (
                    <span className={cn('badge', statusBadgeClass(selectedDocument.conversionStatus))}>
                      {selectedDocument.conversionStatus.replace('_', ' ')}
                    </span>
                  )}
                </div>
                
                <div className="editor-actions">
                  {selectedDocument.type === 'md' && (
                    <div className="editor-mode-tabs">
                      <button
                        className={cn('editor-mode-btn', editorMode === 'edit' && 'active')}
                        onClick={() => setEditorMode('edit')}
                      >
                        Edit
                      </button>
                      <button
                        className={cn('editor-mode-btn', editorMode === 'preview' && 'active')}
                        onClick={() => setEditorMode('preview')}
                      >
                        Preview
                      </button>
                    </div>
                  )}
                  {selectedDocument.type === 'md' && saveState !== 'idle' && saveState !== 'saved' && (
                    <button
                      className="btn btn-secondary btn-sm editor-save-btn"
                      disabled={saveState === 'saving'}
                      onClick={() => void handleSave()}
                    >
                      {saveState === 'saving' ? <RefreshCw className="spin" size={14} /> : 'Save ✓'}
                    </button>
                  )}
                  {selectedDocument.type !== 'md' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={isBusy}
                      onClick={() => void handleConvertDocument(selectedDocument.id)}
                    >
                      <RefreshCw size={13} />
                      Convert
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm editor-icon-btn" title="Download original">
                    <Download size={14} />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm editor-icon-btn danger"
                    disabled={isBusy}
                    onClick={() => void handleDeleteDocument(selectedDocument.id)}
                    title="Delete document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {selectedDocument.type === 'md' ? (
                <div className="editor-body">
                  {editorMode === 'edit' ? (
                    <textarea
                      className="editor-textarea"
                      value={draftMarkdown}
                      spellCheck={false}
                      onChange={(event) => {
                        setDraftMarkdown(event.target.value);
                        setSaveState('dirty');
                      }}
                    />
                  ) : (
                    <MarkdownViewer
                      source={draftMarkdown}
                      title={selectedDocument.title}
                      updatedAt={selectedDocument.updatedAt}
                    />
                  )}
                  <div className="editor-statusbar">
                    <span>Last saved: {new Date(selectedDocument.updatedAt).toLocaleDateString()}</span>
                    <span>{(draftMarkdown.length / 1024).toFixed(1)} KB</span>
                  </div>
                  <SaveIndicator state={saveState} />
                </div>
              ) : (
                <div className="file-placeholder">
                  <FileText size={44} />
                  <div className="placeholder-name">{selectedDocument.title}</div>
                  <div className="placeholder-meta">
                    Original: {selectedDocument.originalPath || 'stored locally'}
                  </div>
                  <div className="placeholder-note">
                    Convert this {selectedDocument.type.toUpperCase()} file to Markdown before using it as AI context.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-file-selected">
              <FolderOpen size={52} />
              <div className="no-file-text">Select a note or upload a new context file.</div>
            </div>
          )}
        </section>
      </div>

      {modal && (
        <NotesFilesModal
          modal={modal}
          folders={folders}
          isBusy={isBusy}
          onClose={() => setModal(null)}
          onCreateDocument={(title, folderId) => void handleCreateDocument(title, folderId)}
          onCreateFolder={(name) => void handleCreateFolder(name)}
          onUpload={(file, folderId) => void handleUpload(file, folderId)}
        />
      )}
    </div>
  );
}

function DocumentTreeRow({
  document,
  isSelected,
  onSelect,
}: {
  document: IprepDocument;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button className={cn('tree-file', isSelected && 'selected')} onClick={onSelect}>
      <FileText className="tree-file-icon" size={14} />
      <span className="tree-file-name">{document.title}</span>
    </button>
  );
}

function NotesFilesModal({
  modal,
  folders,
  isBusy,
  onClose,
  onCreateDocument,
  onCreateFolder,
  onUpload,
}: {
  modal: Exclude<ModalState, null>;
  folders: IprepFolder[];
  isBusy: boolean;
  onClose: () => void;
  onCreateDocument: (title: string, folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
  onUpload: (file: File, folderId: string | null) => void;
}) {
  const [name, setName] = useState('');
  const [folderId, setFolderId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function submit() {
    const trimmedName = name.trim();

    if (modal === 'new-file' && trimmedName) {
      onCreateDocument(trimmedName, folderId || null);
    }

    if (modal === 'new-folder' && trimmedName) {
      onCreateFolder(trimmedName);
    }

    if (modal === 'upload' && selectedFile) {
      onUpload(selectedFile, folderId || null);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-box files-modal">
        <div className="modal-title">
          {modal === 'new-file' && 'New Markdown File'}
          {modal === 'new-folder' && 'New Folder'}
          {modal === 'upload' && 'Upload File'}
        </div>

        {modal !== 'upload' ? (
          <div className="modal-field">
            <label className="modal-label">{modal === 'new-folder' ? 'Folder name' : 'File name'}</label>
            <input
              className="modal-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={modal === 'new-folder' ? 'Behavioral Prep' : 'star-stories'}
              autoFocus
            />
          </div>
        ) : (
          <button className="dropzone" type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={28} />
            <span className="dropzone-text">
              {selectedFile ? selectedFile.name : 'Drag files here or click to browse'}
            </span>
            <span className="dropzone-hint">Supported: .md .pdf .docx</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.pdf,.docx"
              hidden
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </button>
        )}

        {modal !== 'new-folder' && (
          <div className="modal-field">
            <label className="modal-label">Save in folder</label>
            <select
              className="modal-select"
              value={folderId}
              onChange={(event) => setFolderId(event.target.value)}
            >
              <option value="">Root</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={isBusy} onClick={submit}>
            {isBusy && <RefreshCw className="spin" size={14} />}
            {modal === 'upload' ? 'Upload' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TreeLoading() {
  return (
    <div className="tree-loading">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') {
    return null;
  }

  return (
    <div className={cn('save-indicator', state)}>
      {state === 'dirty' && 'Unsaved'}
      {state === 'saving' && 'Saving'}
      {state === 'saved' && 'Saved'}
      {state === 'error' && 'Save failed'}
    </div>
  );
}

function statusBadgeClass(status: IprepDocument['conversionStatus']) {
  if (status === 'completed' || status === 'not_required') {
    return 'badge-success';
  }

  if (status === 'failed') {
    return 'badge-error';
  }

  return 'badge-warning';
}

function MarkdownViewer({
  source,
  title,
  updatedAt,
}: {
  source: string;
  title: string;
  updatedAt: string;
}) {
  const parsed = useMemo(() => parseMarkdownDocument(source), [source]);
  const toc = useMemo(() => extractToc(parsed.content), [parsed.content]);
  const fallbackTitle = title.replace(/\.(md|markdown)$/i, '');
  const displayTitle = parsed.frontmatter.title || firstHeading(parsed.content) || fallbackTitle;
  const description = parsed.frontmatter.description;

  return (
    <div className="editor-preview">
      <div className="markdown-view-shell">
        <article className="markdown-document">
          <div className="markdown-document-meta">
            <span>Last read {new Date(updatedAt).toLocaleDateString()}</span>
          </div>
          <header className="markdown-document-header">
            <h1>{displayTitle}</h1>
            {description && <p>{description}</p>}
            {Object.keys(parsed.frontmatter).length > 0 && (
              <dl className="markdown-frontmatter">
                {Object.entries(parsed.frontmatter)
                  .filter(([key]) => key !== 'title' && key !== 'description')
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </header>
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-anchor'] } }],
              ]}
            >
              {stripFirstHeading(parsed.content, displayTitle)}
            </ReactMarkdown>
          </div>
        </article>
        {toc.length > 0 && (
          <aside className="markdown-toc" aria-label="On this page">
            <div className="markdown-toc-title">On this page</div>
            <nav>
              {toc.map((item) => (
                <a
                  className={cn('markdown-toc-link', item.depth > 2 && 'nested')}
                  href={`#${item.id}`}
                  key={`${item.id}-${item.text}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
}

function parseMarkdownDocument(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return { content: source, frontmatter: {} as Record<string, string> };
  }

  const frontmatter: Record<string, string> = {};

  for (const line of match[1].split(/\r?\n/)) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) {
      frontmatter[key] = value;
    }
  }

  return {
    content: source.slice(match[0].length),
    frontmatter,
  };
}

function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  for (const line of source.split(/\r?\n/)) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line);
    if (!match) {
      continue;
    }

    const text = match[2]
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    items.push({
      id: slugger.slug(text),
      depth: match[1].length,
      text,
    });
  }

  return items;
}

function firstHeading(source: string) {
  const match = /^#\s+(.+)$/m.exec(source);
  return match?.[1].trim() ?? '';
}

function stripFirstHeading(source: string, displayTitle: string) {
  const lines = source.split(/\r?\n/);
  const firstContentLine = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentLine === -1) {
    return source;
  }

  const headingMatch = /^#\s+(.+)$/.exec(lines[firstContentLine]);

  if (!headingMatch || headingMatch[1].trim() !== displayTitle) {
    return source;
  }

  return [...lines.slice(0, firstContentLine), ...lines.slice(firstContentLine + 1)].join('\n');
}
