import { Link } from 'react-router-dom';
import { formatRelative } from '../utils/date';

export default function NoteCard({ note, onDelete }) {
  return (
    <li className="note-card">
      <div className="note-card__head">
        <h2 className="note-card__title">
          <Link to={`/notes/${note.id}`}>{note.title}</Link>
        </h2>
        {note.isPinned && (
          <span className="note-card__pin" title="Pinned" aria-label="Pinned">
            📌
          </span>
        )}
      </div>

      {/* `preview` is plain text derived server-side — never HTML, so no
          dangerouslySetInnerHTML anywhere on the dashboard. */}
      <p className="note-card__preview">
        {note.preview || <span className="muted">No content yet</span>}
      </p>

      <div className="note-card__foot">
        <time className="note-card__date" dateTime={note.updatedAt}>
          {formatRelative(note.updatedAt)}
        </time>
        <div className="note-card__actions">
          <Link className="btn btn--ghost" to={`/notes/${note.id}`}>
            Edit
          </Link>
          <button
            type="button"
            className="btn btn--danger"
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
