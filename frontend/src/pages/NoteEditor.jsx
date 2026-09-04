import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ColorPicker from '../components/ColorPicker';
import ConfirmDialog from '../components/ConfirmDialog';
import TodoEditor from '../components/TodoEditor';
import { emptyChecklist, parseChecklist, serializeChecklist } from '../utils/todoContent';
import Menu from '../components/Menu';
import Spinner from '../components/Spinner';
import * as notesApi from '../api/notes.api';
import { DEFAULT_NOTE_COLOR, TODO_NOTE_COLOR } from '../components/notePalette';
import { QUILL_FORMATS, QUILL_MODULES } from '../config/quill';
import { countWords, isEmpty } from '../utils/text';
import {
  CloseIcon,
  ExpandIcon,
  LinkIcon,
  MoreIcon,
  PrintIcon,
  StarIcon,
  TrashIcon,
} from '../components/icons';

const TITLE_MAX = 200;

function buildNotePayload({ title, contentHtml, isTodo, todoItems, isPinned, color }) {
  const body = isTodo ? serializeChecklist(todoItems) : contentHtml;
  return {
    title: title.trim(),
    contentHtml: isEmpty(body) ? '' : body,
    isPinned,
    color,
    type: isTodo ? 'todo' : 'note',
  };
}

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const { expanded = false, setExpanded, refresh } = useOutletContext() ?? {};
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type');
  const [isTodo, setIsTodo] = useState(() => type === 'todo');
  const [todoItems, setTodoItems] = useState(emptyChecklist);

  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState(() =>
    type === 'todo' ? TODO_NOTE_COLOR : DEFAULT_NOTE_COLOR
  );
  const [confirmTrash, setConfirmTrash] = useState(false);
  const [trashing, setTrashing] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isNew) return;

    let cancelled = false;
    setLoading(true);

    notesApi
      .getNote(id)
      .then(({ note }) => {
        if (cancelled) return;
        setTitle(note.title);
        setContentHtml(note.contentHtml ?? '');
        setIsPinned(Boolean(note.isPinned));
        setColor(note.color || DEFAULT_NOTE_COLOR);
        if (note.type === 'todo') {
          setIsTodo(true);
          setTodoItems(parseChecklist(note.contentHtml));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.status === 404 ? 'That note no longer exists.' : err.message);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
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

    const payload = buildNotePayload({
      title,
      contentHtml,
      isTodo,
      todoItems,
      isPinned,
      color,
    });

    try {
      if (isNew) {
        await notesApi.createNote(payload);
      } else {
        await notesApi.updateNote(id, payload);
      }
      setDirty(false);
      refresh?.();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [title, contentHtml, isTodo, todoItems, isPinned, color, isNew, id, navigate, refresh]);

  const cancel = () => {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    navigate('/');
  };

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving && !loading) save();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [save, saving, loading]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const words = isTodo ? countWords(serializeChecklist(todoItems)) : countWords(contentHtml);

  if (loading) {
    return <Spinner label="Opening note..." />;
  }

  if (loadFailed) {
    return (
      <div className="sheet centered-note">
        <h1>{"Can't open that note"}</h1>
        <p className="muted">{error}</p>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('/')}>
          Back to your notes
        </button>
      </div>
    );
  }

  return (
    <div className="editor" style={{ '--note-color': color }}>
      <div className="editor__head">
        <button
          type="button"
          className="btn-icon"
          onClick={cancel}
          aria-label="Close note"
          title="Close"
        >
          <CloseIcon />
        </button>

        <div className="editor__head-aside">
          {setExpanded && (
            <button
              type="button"
              className="btn-icon"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Collapse note' : 'Expand note'}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              <ExpandIcon />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <div className="editor__titlewrap">
        <input
          id="note-title"
          className="editor__title"
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
            if (titleError) setTitleError('');
          }}
          maxLength={TITLE_MAX + 10}
          aria-label="Title"
          aria-invalid={Boolean(titleError)}
        />
        {titleError && <p className="field__error editor__title-error">{titleError}</p>}
      </div>

      <div className="editor__surface">
        {isTodo ? (
          <TodoEditor
            items={todoItems}
            onChange={(next) => {
              setTodoItems(next);
              setDirty(true);
            }}
          />
        ) : (
          <ReactQuill
            theme="snow"
            value={contentHtml}
            onChange={(value, _delta, source) => {
              setContentHtml(value);
              if (source === 'user') setDirty(true);
            }}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            placeholder="Start writing..."
          />
        )}
      </div>

      <div className="editor__bar">
        <span className="editor__status">
          {dirty && <span className="editor__dot" aria-hidden="true" />}
          {words === 1 ? '1 word' : `${words} words`}
          {dirty && ' · unsaved'}
        </span>

        <div className="editor__tools">
          <ColorPicker
            value={color}
            onChange={(next) => {
              setColor(next);
              setDirty(true);
            }}
          />

          <Menu
            label="More note actions"
            icon={MoreIcon}
            align="right"
            dark
            items={[
              {
                key: 'favorite',
                label: isPinned ? 'Unpin' : 'Pin',
                icon: StarIcon,
                onSelect: () => {
                  setIsPinned((v) => !v);
                  setDirty(true);
                },
              },
              {
                key: 'copy',
                label: 'Copy note link',
                icon: LinkIcon,
                onSelect: () => navigator.clipboard?.writeText(window.location.href),
              },
              { key: 'print', label: 'Print', icon: PrintIcon, onSelect: () => window.print() },
              { separator: true },
              {
                key: 'trash',
                label: 'Delete',
                icon: TrashIcon,
                danger: true,
                disabled: isNew,
                onSelect: () => setConfirmTrash(true),
              },
            ]}
          />
        </div>

        <button
          type="button"
          className="btn btn--primary btn--small"
          onClick={save}
          disabled={saving}
        >
          {saving ? <Spinner inline label="Saving" /> : 'Save note'}
        </button>
      </div>

      {confirmTrash && (
        <ConfirmDialog
          title="Delete this note?"
          message={`"${title || 'Untitled note'}" will be gone for good.`}
          confirmLabel="Delete"
          destructive
          busy={trashing}
          onConfirm={async () => {
            setTrashing(true);
            try {
              await notesApi.deleteNote(id);
              refresh?.();
              navigate('/');
            } catch (err) {
              setError(err.message);
              setConfirmTrash(false);
            } finally {
              setTrashing(false);
            }
          }}
          onCancel={() => setConfirmTrash(false)}
        />
      )}

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          message="This note has edits that haven't been saved yet."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          destructive
          onConfirm={() => navigate('/')}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  );
}
