import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
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
    void refreshWorkspace();
  }, []);

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null);
      setDraftMarkdown('');
      return;
    }

    void loadDocument(selectedDocumentId);
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
        <div className="page-header-left">
          <div className="page-title">Notes & Files</div>
          <div className="page-subtitle">Upload, edit, and attach preparation context</div>
        </div>
        <div className="files-topbar-actions">
          <div className="files-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes"
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setModal('new-folder')}>
            <Folder size={14} /> New Folder
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setModal('new-file')}>
            <Plus size={14} /> New File
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
            <span className="file-tree-title">Workspace</span>
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
                        <FolderOpen className="tree-folder-icon" size={14} />
                      ) : (
                        <Folder className="tree-folder-icon" size={14} />
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
                  <FileText size={16} />
                  <div>
                    <div className="editor-filename">{selectedDocument.title}</div>
                    <div className="editor-file-meta">
                      {selectedDocument.type.toUpperCase()} · {selectedDocument.conversionStatus}
                    </div>
                  </div>
                </div>
                <span className={cn('badge', statusBadgeClass(selectedDocument.conversionStatus))}>
                  {selectedDocument.conversionStatus.replace('_', ' ')}
                </span>
                {selectedDocument.type === 'md' && (
                  <div className="editor-mode-tabs">
                    <button
                      className={cn('editor-mode-btn', editorMode === 'preview' && 'active')}
                      onClick={() => setEditorMode('preview')}
                    >
                      Preview
                    </button>
                    <button
                      className={cn('editor-mode-btn', editorMode === 'edit' && 'active')}
                      onClick={() => setEditorMode('edit')}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                  </div>
                )}
                {selectedDocument.type === 'md' && (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={saveState === 'saving' || saveState === 'idle' || saveState === 'saved'}
                    onClick={() => void handleSave()}
                  >
                    {saveState === 'saving' ? <RefreshCw className="spin" size={13} /> : <Save size={13} />}
                    Save
                  </button>
                )}
                {selectedDocument.type !== 'md' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={isBusy}
                    onClick={() => void handleConvertDocument(selectedDocument.id)}
                  >
                    <RefreshCw size={13} /> Convert
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" title="Download original">
                  <Download size={13} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={isBusy}
                  onClick={() => void handleDeleteDocument(selectedDocument.id)}
                >
                  <Trash2 size={13} />
                </button>
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
                    <div
                      className="editor-preview markdown-preview"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(draftMarkdown) }}
                    />
                  )}
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
      <FileText className="tree-file-icon" size={13} />
      <span className="tree-file-name">{document.title}</span>
      {document.conversionStatus === 'completed' || document.conversionStatus === 'not_required' ? (
        <Check className="tree-status-ok" size={12} />
      ) : (
        <RefreshCw className="tree-status-pending" size={12} />
      )}
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

function renderMarkdown(markdown: string) {
  const lines = markdown.split('\n');
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const escapedLine = escapeHtml(line);

    if (line.startsWith('# ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      html.push('</ul>');
      inList = false;
    }

    html.push(line.trim() ? `<p>${escapedLine}</p>` : '<br />');
  }

  if (inList) {
    html.push('</ul>');
  }

  return html.join('');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
