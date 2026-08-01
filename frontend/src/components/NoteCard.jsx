import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Menu from './Menu';
import { MoreIcon, StarIcon, TrashIcon } from './icons';
import { formatRelative } from '../utils/date';

export default function NoteCard({ note, onTogglePin, onDelete }) {
  const linkClass = ({ isActive }) => clsx('notecard', isActive && 'notecard--active');

  const actions = [
    {
      key: 'pin',
      label: note.isPinned ? 'Unpin' : 'Pin',
      icon: StarIcon,
      onSelect: () => onTogglePin?.(note),
    },
    { separator: true },
    {
      key: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      danger: true,
      onSelect: () => onDelete?.(note),
    },
  ];

  return (
    <li>
      <NavLink
        to={`/notes/${note.id}`}
        className={linkClass}
        style={{ '--note-color': note.color || 'var(--note-default)' }}
      >
        <span className="notecard__body">
          <span className="notecard__title">{note.title || 'Untitled note'}</span>
          {note.preview && <span className="notecard__preview">{note.preview}</span>}
        </span>

        <time className="notecard__date" dateTime={note.updatedAt}>
          {formatRelative(note.updatedAt)}
        </time>

        {note.isPinned && <span className="notecard__pin" aria-label="Pinned" />}

        <span className="notecard__actions">
          <Menu
            label={`Actions for ${note.title || 'Untitled note'}`}
            icon={MoreIcon}
            items={actions}
          />
        </span>
      </NavLink>
    </li>
  );
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    color: PropTypes.string,
    preview: PropTypes.string,
    updatedAt: PropTypes.string,
    isPinned: PropTypes.bool,
  }).isRequired,
  onTogglePin: PropTypes.func,
  onDelete: PropTypes.func,
};

