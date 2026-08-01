import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ColorPicker from '../components/ColorPicker';
import ConfirmDialog from '../components/ConfirmDialog';
import ReminderPicker from '../components/ReminderPicker';
import NoteSidePanel from '../components/NoteSidePanel';
import TodoEditor from '../components/TodoEditor';
import DrawCanvas from '../components/DrawCanvas';
import FileDrop from '../components/FileDrop';
import MediaPanel from '../components/MediaPanel';
import { emptyChecklist, parseChecklist, serializeChecklist } from '../utils/todoContent';
import Menu from '../components/Menu';
import Spinner from '../components/Spinner';
import * as notesApi from '../api/notes.api';
import useSettings from '../hooks/useSettings';
import { DEFAULT_NOTE_COLOR, TODO_NOTE_COLOR } from '../components/notePalette';
import {
  ActivityIcon,
  CloseIcon,
  CopyIcon,
  ExpandIcon,
  HistoryIcon,
  InfoIcon,
  LinkIcon,
  LockIcon,
  MergeIcon,
  MoreIcon,
  MoveIcon,
  PrintIcon,
  ShareIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
  CollaboratorIcon,
  MailIcon,
  GlobeIcon,
  CodeIcon,
  ExportIcon,
} from '../components/icons';

// Anything outside this list gets stripped by the server's sanitizer on save.
const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'indent',
  'align',
  'color',
  'background',
  'blockquote',
  'code-block',
  'link',
];

const TITLE_MAX = 200;

function plainText(html) {
  // textContent runs blocks together, so "<li>a</li><li>b</li>" comes out "ab".
  // Adding a space after each closing tag first keeps the words apart.
  const spaced = (html || '').replace(/<\/(p|li|h[1-6]|blockquote|pre|div)>/gi, '$& ');
  const template = document.createElement('template');
  template.innerHTML = spaced;
  return template.content.textContent || '';
}

// an "empty" quill document still has markup in it
const isEmpty = (html) => plainText(html).trim() === '';

function countWords(html) {
  const text = plainText(html).trim();
  return text ? text.split(/\s+/).length : 0;
}

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  // the tests render this outside the workspace, where there's no outlet context
  const { expanded = false, setExpanded, refresh } = useOutletContext() ?? {};
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  const type = searchParams.get('type');
  // A To Do note swaps the rich text body for a checklist. New notes take the
  // type from the query, existing ones carry it on the record.
  const [isTodo, setIsTodo] = useState(() => type === 'todo');
  // Draw and capture are session only, there's nowhere to store an image yet.
  const isDraw = type === 'draw';
  const isCapture = type === 'capture';
  const isAttach = type === 'attach';
  const media = type === 'audio' || type === 'video' ? type : null;
  const [todoItems, setTodoItems] = useState(emptyChecklist);

  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState(() =>
    type === 'todo' ? TODO_NOTE_COLOR : DEFAULT_NOTE_COLOR
  );
  const [confirmTrash, setConfirmTrash] = useState(false);
  const [panel, setPanel] = useState(null); // 'info' | 'collaborators'
  const [dates, setDates] = useState({ createdAt: null, updatedAt: null });
  const [trashing, setTrashing] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Quill reformats whatever HTML you hand it, so diffing the current value
  // against the loaded one flags "unsaved changes" the moment a note opens.
  // Tracking edits quill tags as source 'user' is the honest signal.
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
        setDates({ createdAt: note.createdAt, updatedAt: note.updatedAt });
        if (note.type === 'todo') {
          setIsTodo(true);
          setTodoItems(parseChecklist(note.contentHtml));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // a 404 also covers "belongs to someone else"
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

    const body = isTodo ? serializeChecklist(todoItems) : contentHtml;

    const payload = {
      title: trimmed,
      contentHtml: isEmpty(body) ? '' : body,
      isPinned,
      color,
      type: isTodo ? 'todo' : 'note',
    };

    try {
      if (isNew) {
        await notesApi.createNote(payload);
      } else {
        await notesApi.updateNote(id, payload);
      }
      setDirty(false);
      // the list pane never unmounts, so it has to be told the note changed
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

  // without this, ctrl/cmd+S opens the browser's "save page" dialog
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

  // closing the tab is the one exit the Cancel guard can't catch
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // rebuilding this remounts the toolbar and steals focus
  const modules = useMemo(
    () => ({
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
      },
      toolbar: {
        container: [
          ['undo', 'redo'],
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block', 'link'],
          ['clean'],
        ],
        handlers: {
          undo() {
            this.quill.history.undo();
          },
          redo() {
            this.quill.history.redo();
          },
        },
      },
    }),
    []
  );

  const words = isTodo ? countWords(serializeChecklist(todoItems)) : countWords(contentHtml);

  if (loading) {
    return <Spinner label="Opening note..." />;
  }

  if (loadFailed) {
    return (
      <div className="sheet centered-note">
        <h1>{"Can't open that note"}</h1>
        <p className="muted">{error}</p>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
          Back to your notes
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx('editor', {
        'editor--draw': isDraw,
        'editor--capture': isCapture,
        'editor--attach': isAttach,
        'editor--media': media,
      })}
      style={{ '--note-color': color }}
    >
      {/* the title is centred between the two corner buttons */}
      <div className="editor__top">
        <button
          type="button"
          className="iconbtn"
          aria-label={expanded ? 'Collapse note' : 'Expand note'}
          aria-pressed={expanded}
          onClick={() => setExpanded?.((v) => !v)}
        >
          <ExpandIcon />
        </button>

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
            setDirty(true);
          }}
          aria-invalid={Boolean(titleError)}
        />

        <button
          type="button"
          className="iconbtn"
          aria-label="Close note"
          onClick={cancel}
          disabled={saving}
        >
          <CloseIcon width={24} height={24} />
        </button>
      </div>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {titleError && <p className="field__error">{titleError}</p>}

      {/* spellcheck is inherited, so setting it here reaches the node quill
          creates without racing its setup */}
      <div className="editor__body" spellCheck={settings.spellCheck}>
        {isDraw ? (
          <DrawCanvas />
        ) : isCapture ? (
          <FileDrop kind="capture" />
        ) : isAttach ? (
          <FileDrop kind="attach" />
        ) : media ? (
          <MediaPanel kind={media} />
        ) : isTodo ? (
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
            modules={modules}
            formats={QUILL_FORMATS}
            placeholder="Start writing..."
          />
        )}
      </div>

      <div className="editor__bar">
        {!isDraw && (
          <span className="editor__status">
            {dirty && <span className="editor__dot" aria-hidden="true" />}
            {words === 1 ? '1 word' : `${words} words`}
            {dirty && ' · unsaved'}
          </span>
        )}

        {!isDraw && (
          <div className="editor__tools">
            <ReminderPicker />

            <ColorPicker
              value={color}
              onChange={(next) => {
                setColor(next);
                setDirty(true);
              }}
            />

            <button
              type="button"
              className={clsx('iconbtn', panel === 'info' && 'iconbtn--on')}
              aria-label="Tags and info"
              onClick={() => setPanel((p) => (p === 'info' ? null : 'info'))}
            >
              <TagIcon />
            </button>

            <button
              type="button"
              className={clsx('iconbtn', panel === 'collaborators' && 'iconbtn--on')}
              aria-label="Collaborators"
              onClick={() => setPanel((p) => (p === 'collaborators' ? null : 'collaborators'))}
            >
              <CollaboratorIcon />
            </button>

            <Menu
              label="Share note"
              icon={ShareIcon}
              align="right"
              dark
              items={[
                { key: 'mail', label: 'Mail', icon: MailIcon, disabled: true },
                { key: 'public', label: 'Public Shareable Link', icon: GlobeIcon, disabled: true },
                { key: 'embed', label: 'Embed link', icon: CodeIcon, disabled: true },
                { separator: true },
                {
                  key: 'copy',
                  label: 'Copy note link',
                  icon: LinkIcon,
                  onSelect: () => navigator.clipboard?.writeText(window.location.href),
                },
                { key: 'export', label: 'Export as', icon: ExportIcon, disabled: true },
              ]}
            />

            <Menu
              label="More note actions"
              icon={MoreIcon}
              align="right"
              dark
              items={[
                { key: 'info', label: 'Info', icon: InfoIcon, disabled: true },
                { key: 'versions', label: 'Versions', icon: HistoryIcon, disabled: true },
                { key: 'activities', label: 'Note Activities', icon: ActivityIcon, disabled: true },
                {
                  key: 'favorite',
                  label: isPinned ? 'Unfavorite' : 'Favorite',
                  icon: StarIcon,
                  onSelect: () => {
                    setIsPinned((v) => !v);
                    setDirty(true);
                  },
                },
                { key: 'merge', label: 'Note Merge', icon: MergeIcon, disabled: true },
                { key: 'lock', label: 'Lock', icon: LockIcon, disabled: true },
                { key: 'copy', label: 'Copy to', icon: CopyIcon, disabled: true },
                { key: 'move', label: 'Move to', icon: MoveIcon, disabled: true },
                { key: 'print', label: 'Print', icon: PrintIcon, onSelect: () => window.print() },
                { key: 'links', label: 'Associated Links', icon: LinkIcon, disabled: true },
                { separator: true },
                {
                  key: 'trash',
                  label: 'Trash',
                  icon: TrashIcon,
                  danger: true,
                  disabled: isNew,
                  onSelect: () => setConfirmTrash(true),
                },
              ]}
            />
          </div>
        )}

        {!isDraw && (
          <button
            type="button"
            className="btn btn--primary btn--small"
            onClick={save}
            disabled={saving}
          >
            {saving ? <Spinner inline label="Saving" /> : 'Save note'}
          </button>
        )}
      </div>

      {panel && (
        <NoteSidePanel
          face={panel}
          note={{ words, characters: plainText(contentHtml).length, ...dates }}
          onClose={() => setPanel(null)}
        />
      )}

      {confirmTrash && (
        <ConfirmDialog
          title="Move to Trash?"
          message={`"${title || 'Untitled note'}" will be gone for good.`}
          confirmLabel="Trash"
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
