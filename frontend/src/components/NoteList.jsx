import PropTypes from 'prop-types';
import clsx from 'clsx';
import NoteCard from './NoteCard';
import Spinner from './Spinner';
import { SearchIcon, StarIcon } from './icons';

export default function NoteList({
  notes,
  loading,
  firstLoad,
  error,
  search,
  setSearch,
  pinnedOnly,
  onTogglePinnedOnly,
  onTogglePin,
  onDelete,
}) {
  const stale = loading && 'notecards--stale';

  const emptyMessage = search.trim()
    ? 'No matching notes'
    : pinnedOnly
      ? 'No pinned notes'
      : 'No notes yet';

  return (
    <section className="listpane" aria-label="Notes">
      <div className="listpane__head">
        <h1 className="listpane__title">{pinnedOnly ? 'Pinned' : 'All Notes'}</h1>

        <button
          type="button"
          className={clsx('iconbtn', pinnedOnly && 'iconbtn--on')}
          aria-label="Show pinned notes only"
          aria-pressed={pinnedOnly}
          onClick={onTogglePinnedOnly}
        >
          <StarIcon width={24} height={24} />
        </button>
      </div>

      <div className="listpane__search">
        <SearchIcon width={18} height={18} />
        <input
          type="search"
          value={search}
          placeholder="Search notes"
          aria-label="Search notes"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="listpane__scroll">
        {error && (
          <p className="listpane__note" role="alert">
            {error}
          </p>
        )}

        {firstLoad && <Spinner label="Loading notes..." />}

        {!firstLoad && notes.length === 0 && !error && (
          <p className="listpane__note">{emptyMessage}</p>
        )}

        {notes.length > 0 && (
          <ul className={clsx('notecards notecards--medium', stale)}>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onTogglePin={onTogglePin} onDelete={onDelete} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

NoteList.propTypes = {
  notes: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  firstLoad: PropTypes.bool,
  error: PropTypes.string,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  pinnedOnly: PropTypes.bool,
  onTogglePinnedOnly: PropTypes.func.isRequired,
  onTogglePin: PropTypes.func,
  onDelete: PropTypes.func,
};
