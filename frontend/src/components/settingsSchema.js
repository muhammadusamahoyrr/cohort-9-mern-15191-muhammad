/**
 * The Settings drawer as data.
 *
 * `enabled: true` means the client can honour the preference by itself, so it
 * gets wired to SettingsContext and persists. The rest render their real
 * control but stay inert, since they'd need a server or a schema change. They
 * are shown rather than hidden so the drawer still looks finished.
 */

export const SETTINGS_SECTIONS = [
  {
    key: 'general',
    title: 'General',
    rows: [
      { key: 'defaultNotebook', label: 'Default Notebook', type: 'link', value: 'My Notebook' },
      { key: 'nightMode', label: 'Night Mode', type: 'toggle', enabled: true },
      {
        key: 'uploadQuality',
        label: 'Upload Resource Quality',
        type: 'select',
        value: 'original',
        options: [
          { value: 'original', label: 'Original' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
    ],
  },
  {
    key: 'layout',
    title: 'Choose your layout',
    rows: [{ key: 'layout', type: 'layout', enabled: true }],
  },
  {
    key: 'noteCards',
    title: 'Note Cards',
    rows: [
      { key: 'modernEditor', label: 'Switch to modern editor', type: 'toggle', value: true },
      { key: 'openAsTab', label: 'Open as tab', type: 'toggle', value: false },
      { key: 'showTimeOnNote', label: 'Show Time on Note', type: 'toggle', enabled: true },
      {
        key: 'defaultNoteColor',
        label: 'Default Note Color',
        type: 'select',
        value: 'random',
        options: [
          { value: 'random', label: 'Random' },
          { value: 'theme', label: 'Theme-based' },
          { value: 'choose', label: 'Choose color' },
        ],
      },
      {
        key: 'editorFont',
        label: 'Editor Font',
        type: 'select',
        enabled: true,
        options: [
          { value: 'sans', label: 'Sans' },
          { value: 'serif', label: 'Serif' },
          { value: 'mono', label: 'Mono' },
        ],
      },
      {
        key: 'smartCards',
        label: 'Generate Smart Cards',
        hint: 'Smartcards beautify content saved to Notebook, presenting you with distinct, groupable, formatted notecards.',
        type: 'toggle',
        value: true,
      },
      {
        key: 'photoGrouping',
        label: 'Photo Card Grouping',
        type: 'select',
        value: 'same',
        options: [
          { value: 'same', label: 'Add all images to the same photo card' },
          { value: 'separate', label: 'Add each image in a separate Photo card' },
        ],
      },
      { key: 'spellCheck', label: 'Spell Check', type: 'toggle', enabled: true },
      { key: 'linkPreview', label: 'Link Preview', type: 'toggle', value: false },
      { key: 'emailIn', label: 'Email-In notes', type: 'link' },
      {
        key: 'bookmarkCard',
        label: 'Bookmark Card',
        hint: 'Auto generate reader content for bookmark cards.',
        type: 'toggle',
        value: true,
      },
      { key: 'notebookAi', label: 'Notebook AI', type: 'link' },
    ],
  },
  {
    key: 'privacy',
    title: 'Privacy & Security',
    rows: [
      { key: 'usageReports', label: 'Send Usage Reports', type: 'toggle', value: true },
      { key: 'anonReports', label: 'Send Reports Anonymously', type: 'toggle', value: false },
      { key: 'crashReports', label: 'Send Crash Reports', type: 'toggle', value: true },
      { key: 'passcode', label: 'Set Passcode', type: 'link' },
      { key: 'blocked', label: 'Blocked Collaborators', type: 'link' },
      { key: 'zohoContacts', label: 'Add To Zoho Contacts', type: 'toggle', value: false },
    ],
  },
  {
    key: 'migration',
    title: 'Migration',
    rows: [
      { key: 'evernote', label: 'Migrate from Evernote', type: 'link' },
      { key: 'onenote', label: 'Migrate from OneNote', type: 'link' },
      { key: 'keep', label: 'Migrate from Google Keep', type: 'link' },
      { key: 'pocket', label: 'Migrate from Pocket', type: 'link' },
      { key: 'mailNotes', label: 'Migrate Mail Notes', type: 'link' },
      { key: 'importMd', label: 'Import Markdown', type: 'link' },
      { key: 'importHtml', label: 'Import HTML', type: 'link' },
      { key: 'export', label: 'Export', type: 'link' },
    ],
  },
  {
    key: 'integration',
    title: 'Integration',
    rows: [
      { key: 'zapier', label: 'Zapier Integration', type: 'link' },
      { key: 'slack', label: 'Slack Integration', type: 'link' },
    ],
  },
];
