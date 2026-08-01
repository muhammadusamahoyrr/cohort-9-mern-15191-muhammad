import { createContext, useCallback, useMemo, useState } from 'react';

export const CollectionsContext = createContext(null);

const STORAGE_KEY = 'notebook.collections';

// covers a new notebook cycles through
const COVERS = ['#e42527', '#ffc27d', '#57c2ff', '#12a150', '#d1c4e9', '#ffed7d'];

const DEFAULTS = {
  notebooks: [{ id: 'my', name: 'My Notebook', cover: '#ffc27d' }],
  boards: [{ id: 'my', name: 'My Noteboard' }],
};

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `c${Math.random().toString(36).slice(2)}`;

/**
 * Notebooks and boards. These live in localStorage rather than the API: there
 * is no table for them yet, so a notebook you create can't hold notes. They do
 * survive a reload, which keeps the rail looking like you left it.
 */
export function CollectionsProvider({ children }) {
  const [state, setState] = useState(read);

  const save = useCallback((next) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // a full or blocked quota shouldn't break the action itself
    }
  }, []);

  const add = useCallback(
    (kind) => {
      const list = state[kind];
      // no dialog, just create it and let the user rename
      const item = {
        id: newId(),
        name: 'Untitled',
        // the default notebook already has COVERS[1], so offset new ones to
        // make the first one you add look different
        ...(kind === 'notebooks'
          ? { cover: COVERS[Math.max(0, list.length - 1) % COVERS.length] }
          : {}),
      };
      save({ ...state, [kind]: [item, ...list] });
      return item;
    },
    [state, save]
  );

  const rename = useCallback(
    (kind, id, name) =>
      save({
        ...state,
        [kind]: state[kind].map((c) => (c.id === id ? { ...c, name } : c)),
      }),
    [state, save]
  );

  const setCover = useCallback(
    (kind, id, cover) =>
      save({
        ...state,
        [kind]: state[kind].map((c) => (c.id === id ? { ...c, cover } : c)),
      }),
    [state, save]
  );

  const remove = useCallback(
    (kind, id) => save({ ...state, [kind]: state[kind].filter((c) => c.id !== id) }),
    [state, save]
  );

  const value = useMemo(
    () => ({ ...state, covers: COVERS, add, rename, setCover, remove }),
    [state, add, rename, setCover, remove]
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}
