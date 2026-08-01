import { useState } from 'react';
import { BoardIcon, CloseIcon, NotesIcon, PlusIcon, ReminderIcon, TagIcon } from './icons';
import { formatDateTime } from '../utils/date';

// Slides in over the right of the editor. The tag and collaborator buttons
// open the same panel with a different face.
export default function NoteSidePanel({ face, note, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard is permission gated, and the user can still copy by hand
    }
  };

  return (
    <aside className="notepanel" role="dialog" aria-label={face === 'info' ? 'Note info' : 'Collaborators'}>
      <header className="notepanel__head">
        <h2 className="notepanel__title">{face === 'info' ? 'Info' : 'Collaborators'}</h2>
        <button type="button" className="iconbtn" aria-label="Close panel" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>

      {face === 'info' ? (
        <div className="notepanel__body">
          <div className="notepanel__thumb" aria-hidden="true">
            <NotesIcon width={28} height={28} />
          </div>

          <dl className="notefacts">
            <div className="notefacts__row">
              <dt>
                <BoardIcon width={18} height={18} />
                <span className="visually-hidden">Counts</span>
              </dt>
              <dd>
                {note.words} Word(s) , {note.characters} Character(s)
              </dd>
            </div>
            <div className="notefacts__row">
              <dt>
                <NotesIcon width={18} height={18} />
                <span className="visually-hidden">Notebook</span>
              </dt>
              <dd className="notefacts__strong">My Notebook</dd>
            </div>
            <div className="notefacts__row">
              <dt>
                <ReminderIcon width={18} height={18} />
                <span className="visually-hidden">Created</span>
              </dt>
              <dd>
                Created on <strong>{formatDateTime(note.createdAt) || '—'}</strong>
              </dd>
            </div>
            <div className="notefacts__row">
              <dt>
                <ReminderIcon width={18} height={18} />
                <span className="visually-hidden">Modified</span>
              </dt>
              <dd>
                Modified on <strong>{formatDateTime(note.updatedAt) || '—'}</strong>
              </dd>
            </div>
          </dl>

          <section className="notepanel__section">
            <div className="notepanel__sectionhead">
              <h3>Tags</h3>
              <TagIcon width={18} height={18} />
            </div>
            {/* inert until tags get a table of their own */}
            <button type="button" className="notepanel__placeholder" disabled>
              Add Tag
            </button>
          </section>
        </div>
      ) : (
        <div className="notepanel__body">
          <button type="button" className="notepanel__add" disabled>
            <PlusIcon width={18} height={18} />
            <span>Add members</span>
          </button>

          <section className="notepanel__section">
            <div className="notepanel__sectionhead">
              <h3>Note Link</h3>
            </div>
            <div className="notelink">
              <input type="text" readOnly value={window.location.href} aria-label="Note link" />
              <button type="button" className="btn btn--secondary btn--small" onClick={copyLink}>
                Copy
              </button>
            </div>
            {copied && <p className="notelink__done">Link Copied</p>}
          </section>
        </div>
      )}
    </aside>
  );
}
