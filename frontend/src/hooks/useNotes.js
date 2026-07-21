import { useCallback, useEffect, useState } from 'react';
import * as notesApi from '../api/notes.api';

const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_PAGINATION = { page: 1, limit: 0, total: 0, totalPages: 0 };

/**
 * Owns everything the dashboard list needs: query state, fetching, and the
 * bookkeeping around deleting a row. Kept out of Dashboard.jsx so the page
 * stays about markup.
 */
export default function useNotes({ limit = 9 } = {}) {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('updated_at');
  const [order, setOrder] = useState('desc');
  // Bumped to force a refetch without changing any query parameter.
  const [reloadKey, setReloadKey] = useState(0);

  // Typing shouldn't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // A new search term has to start from page 1, otherwise a search run from
  // page 3 can land on an empty page of a much shorter result set.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, order]);

  useEffect(() => {
    let stale = false;
    setLoading(true);

    notesApi
      .listNotes({ search: debouncedSearch, page, limit, sort, order })
      .then((data) => {
        if (stale) return;
        setNotes(data.notes);
        setPagination(data.pagination);
        setError(null);
      })
      .catch((err) => {
        if (stale) return;
        setError(err.message);
        setNotes([]);
        setPagination(EMPTY_PAGINATION);
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    // Responses can arrive out of order while the user types; only the last
    // request started is allowed to write to state.
    return () => {
      stale = true;
    };
  }, [debouncedSearch, page, limit, sort, order, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const remove = useCallback(
    async (id) => {
      await notesApi.deleteNote(id);
      // Deleting the only note on the last page would otherwise leave the user
      // staring at an empty grid with no obvious way back. Stepping back a page
      // already refetches, so only the same-page case needs refresh().
      if (notes.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refresh();
      }
    },
    [notes.length, page, refresh]
  );

  const changeSort = useCallback((value) => {
    const [nextSort, nextOrder] = value.split(':');
    setSort(nextSort);
    setOrder(nextOrder);
  }, []);

  return {
    notes,
    pagination,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    sortValue: `${sort}:${order}`,
    changeSort,
    refresh,
    remove,
  };
}
