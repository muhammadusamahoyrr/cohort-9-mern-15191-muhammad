import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import * as notesApi from '../api/notes.api';

const emptyPage = { page: 1, limit: 0, total: 0, totalPages: 0 };

/**
 * @typedef {Object} UseNotes
 * @property {import('../api/notes.api').Note[]} notes
 * @property {import('../api/notes.api').Pagination} pagination
 * @property {boolean} loading
 * @property {boolean} firstLoad   true only until the first response lands
 * @property {string|null} error   message from a failed list or delete
 * @property {string} search       raw input, debounced before it is sent
 * @property {(value: string) => void} setSearch
 * @property {number} page
 * @property {(page: number) => void} setPage
 * @property {string} sortValue    'field:direction', e.g. 'updated_at:desc'
 * @property {(value: string) => void} changeSort
 * @property {() => void} refresh
 * @property {(id: number) => Promise<void>} remove
 */

/**
 * Owns the notes list: search, paging, sorting and deletion.
 *
 * @param {{ limit?: number }} [options]
 * @returns {UseNotes}
 */
export default function useNotes({ limit = 9 } = {}) {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(emptyPage);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [query] = useDebounce(search.trim(), 300);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('updated_at');
  const [order, setOrder] = useState('desc');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [query, sort, order]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    notesApi
      .listNotes({ search: query, page, limit, sort, order })
      .then((data) => {
        if (cancelled) return;
        setNotes(data.notes);
        setPagination(data.pagination);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setNotes([]);
        setPagination(emptyPage);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setHasLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [query, page, limit, sort, order, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const remove = useCallback(
    async (id) => {
      try {
        await notesApi.deleteNote(id);
      } catch (err) {
        // Surface it the same way a failed fetch is surfaced, otherwise a
        // delete that never happened looks identical to one that did.
        setError(err.message);
        return;
      }
      setError(null);
      // deleting the last note on page 2+ would leave an empty grid
      if (notes.length === 1 && page > 1) setPage(page - 1);
      else refresh();
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
    firstLoad: loading && !hasLoaded,
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
