import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
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

  const isSearching = search.trim().length > 0;

  return (
    <>
      <div className="page__header">
        <div>
          <h1>Your notes</h1>
          <p className="muted" style={{ margin: 0 }}>
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
          className="sort-select"
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
        <div className="alert alert--error" role="alert">
          {error || deleteError}
        </div>
      )}

      {loading && <Spinner label="Loading your notes…" />}

      {!loading && notes.length === 0 && !error && (
        <div className="empty">
          {isSearching ? (
            <>
              <h2>No matches</h2>
              <p>Nothing here matches “{search.trim()}”.</p>
              <button type="button" className="btn btn--ghost" onClick={() => setSearch('')}>
                Clear search
              </button>
            </>
          ) : (
            <>
              <h2>Nothing written yet</h2>
              <p>Your notes will show up here once you write one.</p>
              <Link to="/notes/new" className="btn btn--primary">
                Write your first note
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && notes.length > 0 && (
        <ul className="note-grid">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={setPendingDelete} />
          ))}
        </ul>
      )}

      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <span className="pagination__status">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn btn--ghost"
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
