import { act, renderHook, waitFor } from '@testing-library/react';
import useNotes from '../../hooks/useNotes';
import useAuth from '../../hooks/useAuth';
import * as notesApi from '../../api/notes.api';
import { buildNote, buildPagination } from '../helpers/render';

jest.mock('../../api/notes.api');

const page = (notes, pagination = {}) => ({
  notes,
  pagination: buildPagination({ total: notes.length, ...pagination }),
});

describe('useNotes', () => {
  it('steps back a page when the last note on it is deleted', async () => {
    notesApi.listNotes.mockResolvedValue(
      page([buildNote()], { page: 2, totalPages: 2, total: 10 })
    );
    notesApi.deleteNote.mockResolvedValue('');

    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.notes).toHaveLength(1));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.page).toBe(2));

    await act(async () => {
      await result.current.remove(1);
    });

    expect(result.current.page).toBe(1);
  });

  it('stays on the page when other notes remain', async () => {
    notesApi.listNotes.mockResolvedValue(
      page([buildNote({ id: 1 }), buildNote({ id: 2 })], { page: 2, totalPages: 2, total: 11 })
    );
    notesApi.deleteNote.mockResolvedValue('');

    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.notes).toHaveLength(2));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.page).toBe(2));

    await act(async () => {
      await result.current.remove(1);
    });

    expect(result.current.page).toBe(2);
    expect(notesApi.deleteNote).toHaveBeenCalledWith(1);
  });

  it('returns to the first page when the sort changes', async () => {
    notesApi.listNotes.mockResolvedValue(page([buildNote()], { totalPages: 4, total: 30 }));

    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.notes).toHaveLength(1));

    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.page).toBe(3));

    act(() => result.current.changeSort('title:asc'));

    await waitFor(() => expect(result.current.page).toBe(1));
    expect(result.current.sortValue).toBe('title:asc');
    await waitFor(() =>
      expect(notesApi.listNotes).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: 'title', order: 'asc', page: 1 })
      )
    );
  });

  it('surfaces a failure and empties the list rather than showing stale rows', async () => {
    notesApi.listNotes.mockRejectedValue(new Error('Cannot reach the server.'));

    const { result } = renderHook(() => useNotes());

    await waitFor(() => expect(result.current.error).toBe('Cannot reach the server.'));
    expect(result.current.notes).toEqual([]);
    expect(result.current.pagination.total).toBe(0);
  });
});

describe('useAuth', () => {
  it('fails loudly when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(/must be used inside an <AuthProvider>/);

    consoleError.mockRestore();
  });
});
