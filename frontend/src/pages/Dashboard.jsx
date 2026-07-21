import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import useNotes from '../hooks/useNotes';

const SORT_OPTIONS = [
  { value: 'updated_at:desc', label: 'Last edited' },
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'title:asc', label: 'Title A–Z' },
];

export default function Dashboard() {
  const {
    notes,
    pagination,
    loading,
    firstLoad,
    error,
    search,
    setSearch,
    page,
    setPage,
    sortValue,
    changeSort,
    remove,
  } = useNotes();

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await remove(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const term = search.trim();
  const showEmpty = !firstLoad && notes.length === 0 && !error;

  return (
    <>
      <div className="page__header">
        <div>
          <h1>Your notes</h1>
          <p className="page__count">
            {pagination.total === 1 ? '1 note' : `${pagination.total} notes`}
          </p>
        </div>
        <Link to="/notes/new" className="btn btn--primary">
          New note
        </Link>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <label className="visually-hidden" htmlFor="sort">
          Sort notes
        </label>
        <select
          id="sort"
          className="sort"
          value={sortValue}
          onChange={(e) => changeSort(e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {(error || deleteError) && (
        <div className="alert" role="alert">
          {error || deleteError}
        </div>
      )}

      {/* Announced to screen readers on every query; sighted users read the count above. */}
      <p className="visually-hidden" role="status">
        {firstLoad ? 'Loading notes' : `${pagination.total} notes found`}
      </p>

      {firstLoad && <Spinner label="Opening your notebook…" />}

      {showEmpty &&
        (term ? (
          <EmptyState title="No matches" body={`Nothing here matches “${term}”.`}>
            <button type="button" className="btn btn--secondary" onClick={() => setSearch('')}>
              Clear search
            </button>
          </EmptyState>
        ) : (
          <EmptyState
            title="Nothing written yet"
            body="Your notes will show up here once you write one."
          >
            <Link to="/notes/new" className="btn btn--primary">
              Write your first note
            </Link>
          </EmptyState>
        ))}

      {notes.length > 0 && (
        <ul className={`note-grid${loading ? ' note-grid--stale' : ''}`}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={setPendingDelete} />
          ))}
        </ul>
      )}

      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <span className="annotation">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages || loading}
          >
            Next
          </button>
        </nav>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this note?"
          message={`“${pendingDelete.title}” will be gone for good.`}
          confirmLabel="Delete"
          destructive
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => {
            setPendingDelete(null);
            setDeleteError('');
          }}
        />
      )}
    </>
  );
}
