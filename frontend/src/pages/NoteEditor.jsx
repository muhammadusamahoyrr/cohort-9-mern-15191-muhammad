import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import * as notesApi from '../api/notes.api';

// Only the formats the server's sanitizer allowlist keeps (docs/01-ARCHITECTURE.md).
// Offering anything else would let people apply styling that silently vanishes on save.
const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'blockquote',
  'code-block',
  'link',
];

const TITLE_MAX = 200;

// Quill's "empty" document still has markup in it.
const isBlankHtml = (html) => !html || html.replace(/<(p|br)\s*\/?>/g, '').trim() === '';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Snapshot of what's on the server, so "did the user change anything?" is a
  // comparison rather than a flag that every onChange has to remember to set.
  const saved = useRef({ title: '', contentHtml: '', isPinned: false });

  const dirty =
    title !== saved.current.title ||
    contentHtml !== saved.current.contentHtml ||
    isPinned !== saved.current.isPinned;

  useEffect(() => {
    if (isNew) return;

    let stale = false;
    setLoading(true);

    notesApi
      .getNote(id)
      .then(({ note }) => {
        if (stale) return;
        setTitle(note.title);
        setContentHtml(note.contentHtml ?? '');
        setIsPinned(Boolean(note.isPinned));
        saved.current = {
          title: note.title,
          contentHtml: note.contentHtml ?? '',
          isPinned: Boolean(note.isPinned),
        };
      })
      .catch((err) => {
        if (stale) return;
        // 404 also covers "belongs to someone else" — see docs/03-API.md.
        setError(err.status === 404 ? 'That note no longer exists.' : err.message);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [id, isNew]);

  const save = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError('Give the note a title');
      return;
    }
    if (trimmed.length > TITLE_MAX) {
      setTitleError(`Titles are limited to ${TITLE_MAX} characters`);
      return;
    }

    setTitleError('');
    setError('');
    setSaving(true);

    const payload = {
      title: trimmed,
      contentHtml: isBlankHtml(contentHtml) ? '' : contentHtml,
      isPinned,
    };

    try {
      if (isNew) {
        await notesApi.createNote(payload);
      } else {
        await notesApi.updateNote(id, payload);
      }
      saved.current = { ...payload };
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [title, contentHtml, isPinned, isNew, id, navigate]);

  const cancel = () => {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    navigate('/');
  };

  // Ctrl/Cmd+S is what people reach for in an editor; without this the browser
  // opens its "save page" dialog instead.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving && !loading) save();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [save, saving, loading]);

  // Rebuilding this object on every render remounts the toolbar and steals focus.
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block', 'link'],
        ['clean'],
      ],
    }),
    []
  );

  if (loading) {
    return <Spinner label="Opening note…" />;
  }

  if (loadFailed) {
    return (
      <div className="not-found">
        <h1>Can’t open that note</h1>
        <p className="muted">{error}</p>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="page__header">
        <h1>{isNew ? 'New note' : 'Edit note'}</h1>
      </div>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      <label className="visually-hidden" htmlFor="note-title">
        Title
      </label>
      <input
        id="note-title"
        className="editor__title"
        type="text"
        placeholder="Title"
        maxLength={TITLE_MAX}
        value={title}
        autoFocus
        onChange={(e) => {
          setTitle(e.target.value);
          setTitleError('');
        }}
        aria-invalid={Boolean(titleError)}
      />
      {titleError && (
        <p className="field__error" style={{ marginTop: '-0.6rem' }}>
          {titleError}
        </p>
      )}

      <div className="editor__body">
        <ReactQuill
          theme="snow"
          value={contentHtml}
          onChange={setContentHtml}
          modules={quillModules}
          formats={QUILL_FORMATS}
          placeholder="Start writing…"
        />
      </div>

      <div className="editor__actions">
        <button type="button" className="btn btn--primary" onClick={save} disabled={saving}>
          {saving ? <Spinner inline label="Saving" /> : 'Save'}
        </button>
        <label className="editor__hint" style={{ display: 'flex', gap: '0.35rem' }}>
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
          />
          Pin to top
        </label>
        <button type="button" className="btn btn--ghost" onClick={cancel} disabled={saving}>
          Cancel
        </button>
      </div>

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          message="This note has edits that haven’t been saved yet."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          destructive
          onConfirm={() => navigate('/')}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </>
  );
}
