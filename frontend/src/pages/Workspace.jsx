import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import ConfirmDialog from '../components/ConfirmDialog';
import NoteList from '../components/NoteList';
import Sidebar from '../components/Sidebar';
import TrashView from './TrashView';
import BoardView from './BoardView';
import SearchView from './SearchView';
import * as notesApi from '../api/notes.api';
import useNotes from '../hooks/useNotes';
import useSettings from '../hooks/useSettings';
import useCollections from '../hooks/useCollections';
import { viewFor } from '../components/listViews';

export default function Workspace() {
  const { settings, set } = useSettings();
  const { notebooks, boards } = useCollections();
  const { id: openId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const noteOpen = pathname.startsWith('/notes/');
  const isTrash = pathname === '/trash';
  const isBoard = pathname.startsWith('/boards/');
  const isSearch = pathname === '/search';
  const wide = isTrash || isBoard || isSearch;

  const baseView = viewFor(noteOpen ? '/' : pathname);
  const openNotebook = pathname.startsWith('/notebooks/')
    ? notebooks.find((n) => pathname.endsWith(`/${n.id}`))
    : null;
  const view = openNotebook ? { ...baseView, title: openNotebook.name } : baseView;

  const [tab, setTab] = useState(null);
  const {
    notes,
    loading,
    firstLoad,
    error,
    search,
    setSearch,
    sortValue,
    changeSort,
    refresh,
    remove,
  } = useNotes({ limit: 100 });

  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  // The sort params go to the API, but the dev mock ignores them. Sorting an
  // already-sorted list costs nothing, so doing it here works against both.
  const sorted = useMemo(() => {
    const [key, direction] = sortValue.split(':');
    const rows = notes.filter((note) => !pinnedOnly || note.isPinned);

    const compare = (a, b) => {
      if (key === 'title') return String(a.title).localeCompare(String(b.title));
      if (key === 'created_at') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    };

    return rows.sort((a, b) => (direction === 'desc' ? -compare(a, b) : compare(a, b)));
  }, [notes, pinnedOnly, sortValue]);

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
      // otherwise the editor keeps showing a note that no longer exists
      if (String(pendingDelete.id) === String(openId)) navigate('/');
      setPendingDelete(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    // note-open drives the one-pane-at-a-time swap on narrow screens
    <div
      className={clsx('shell', `shell--${settings.layout}`, {
        'shell--expanded': expanded,
        'shell--note-open': noteOpen,
        'shell--wide': wide,
      })}
    >
      <Sidebar />

      {isSearch ? (
        <SearchView
          notes={sorted}
          loading={loading}
          search={search}
          setSearch={setSearch}
          onTogglePin={togglePin}
          onDelete={setPendingDelete}
        />
      ) : isTrash ? (
        <TrashView />
      ) : isBoard ? (
        <BoardView
          notes={sorted}
          name={boards.find((b) => pathname.endsWith(`/${b.id}`))?.name ?? 'Noteboard'}
        />
      ) : (
        <>
          <div className="shell__list">
            <NoteList
              notes={view.live ? sorted : []}
              loading={loading}
              firstLoad={firstLoad}
              error={error || actionError}
              search={search}
              setSearch={setSearch}
              pinnedOnly={pinnedOnly}
              onTogglePinnedOnly={() => setPinnedOnly((v) => !v)}
              sortValue={sortValue}
              onChangeSort={changeSort}
              previewSize={settings.previewSize}
              onChangePreviewSize={(v) => set('previewSize', v)}
              view={view}
              activeTab={tab ?? view.tabs?.[0]}
              onChangeTab={setTab}
              onTogglePin={togglePin}
              onDelete={setPendingDelete}
            />
          </div>

          <div className="shell__editor">
            {/* the editor needs refresh: saving changes a note's title, colour
                and pin state, and the list beside it stays mounted */}
            <Outlet context={{ expanded, setExpanded, refresh }} />
          </div>
        </>
      )}

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
