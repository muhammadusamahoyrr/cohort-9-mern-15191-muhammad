import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const SettingsContext = createContext(null);

const STORAGE_KEY = 'notebook.settings';

// only the preferences the client can honour by itself. anything needing a
// column on the note (default colour, reminders, tags) is left out
export const DEFAULT_SETTINGS = {
  nightMode: false,
  layout: 'multipane', // 'multipane' | 'grid'
  showTimeOnNote: true,
  spellCheck: true,
  editorFont: 'sans', // 'sans' | 'serif' | 'mono'
  previewSize: 'medium', // 'small' | 'medium' | 'large'
};

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // merge over the defaults, or a preference added later comes back
    // undefined for anyone with an older blob saved
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(read);

  const set = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // a full or blocked quota shouldn't break the setting itself
      }
      return next;
    });
  }, []);

  // theme hangs off the root element so every stylesheet can see it, including
  // the bits that render outside the react tree
  useEffect(() => {
    document.documentElement.dataset.theme = settings.nightMode ? 'dark' : 'light';
    document.documentElement.dataset.editorFont = settings.editorFont;
  }, [settings.nightMode, settings.editorFont]);

  const value = useMemo(() => ({ settings, set }), [settings, set]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
