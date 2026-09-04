import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import ConfirmDialog from '../components/ConfirmDialog';
import NoteList from '../components/NoteList';
import * as notesApi from '../api/notes.api';
import useNotes from '../hooks/useNotes';

export default function Workspace() {
  const { id: openId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const noteOpen = pathname.startsWith('/notes/');

  const { notes, loading, firstLoad, error, search, setSearch, refresh, remove } = useNotes({
    limit: 100,
  });

  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const visible = useMemo(
    () =>
      notes
        .filter((note) => !pinnedOnly || note.isPinned)
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }),
    [notes, pinnedOnly]
  );

  const togglePin = useCallback(
    async (note) => {
      setActionError('');
      try {
        await notesApi.updateNote(note.id, { isPinned: !note.isPinned });
        refresh();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refresh]
  );

  const confirmDelete = async () => {
    setDeleting(true);
    setActionError('');
    try {
      await remove(pendingDelete.id);
      if (String(pendingDelete.id) === String(openId)) navigate('/');
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={clsx('shell', {
        'shell--expanded': expanded,
        'shell--note-open': noteOpen,
      })}
    >
      <div className="shell__list">
        <NoteList
          notes={visible}
          loading={loading}
          firstLoad={firstLoad}
          error={error || actionError}
          search={search}
          setSearch={setSearch}
          pinnedOnly={pinnedOnly}
          onTogglePinnedOnly={() => setPinnedOnly((v) => !v)}
          onTogglePin={togglePin}
          onDelete={setPendingDelete}
        />
      </div>

      <div className="shell__editor">
        <Outlet context={{ expanded, setExpanded, refresh }} />
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this note?"
          message={`"${pendingDelete.title || 'Untitled note'}" will be gone for good.`}
          confirmLabel="Delete"
          destructive
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
