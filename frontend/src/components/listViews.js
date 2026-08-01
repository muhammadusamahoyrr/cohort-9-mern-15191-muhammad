/**
 * The three list-pane views. Shared and Reminders each have their own pills
 * and empty wording, but no data: both need tables the API doesn't have, so
 * they render their chrome over an empty list.
 */
export const LIST_VIEWS = {
  '/': {
    title: 'All Notes',
    tabs: null,
    tools: ['pinned', 'search', 'more'],
    tabStyle: null,
    empty: 'No notes yet',
    emptySize: '16px',
    live: true,
  },
  '/shared': {
    title: 'Shared',
    tabs: ['All', 'Notes', 'Notebooks', 'Collections'],
    // search and options, but no favourites star
    tools: ['search', 'more'],
    // the two views space their pills differently, so the metric travels with
    // the view instead of sitting on one shared rule
    tabStyle: 'shared',
    empty: "Uh-oh! You've got no items shared with you.",
    emptySize: '15px',
    live: false,
  },
  '/reminders': {
    title: 'Reminders',
    tabs: ['Overdue', 'Upcoming'],
    tools: ['more'],
    tabStyle: 'reminders',
    // no search here, unlike Shared
    empty: 'No Reminders Available',
    emptySize: '16px',
    live: false,
  },
};

// same as All Notes, but under the notebook's own name and with a count
export const NOTEBOOK_VIEW = {
  title: 'My Notebook',
  tabs: null,
  tools: ['pinned', 'search', 'more'],
  tabStyle: null,
  empty: 'No notes yet',
  emptySize: '16px',
  showCount: true,
  live: true,
};

export const viewFor = (pathname) => {
  if (pathname.startsWith('/notebooks/')) return NOTEBOOK_VIEW;
  return LIST_VIEWS[pathname] ?? LIST_VIEWS['/'];
};
