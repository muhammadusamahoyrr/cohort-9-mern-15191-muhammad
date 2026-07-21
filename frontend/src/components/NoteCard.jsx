import { Link } from 'react-router-dom';
import { formatRelative } from '../utils/date';

export default function NoteCard({ note, onDelete }) {
  return (
    <li className={`sheet note-card${note.isPinned ? ' note-card--pinned' : ''}`}>
      {note.isPinned && <span className="note-card__flag">Pinned</span>}

      <h2 className="note-card__title">
        <Link to={`/notes/${note.id}`}>{note.title}</Link>
      </h2>

      {/* `preview` is plain text derived server-side — never HTML, so the
          dashboard has no reason to render markup at all. */}
      <p className="note-card__preview">
        {note.preview || <span className="muted">Empty note</span>}
      </p>

      <div className="note-card__foot">
        <time className="annotation" dateTime={note.updatedAt}>
          {formatRelative(note.updatedAt)}
        </time>
        <div className="note-card__actions">
          <Link className="btn btn--quiet btn--small" to={`/notes/${note.id}`}>
            Edit
          </Link>
          <button
            type="button"
            className="btn btn--danger btn--small"
            onClick={() => onDelete(note)}
            aria-label={`Delete ${note.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
