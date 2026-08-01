import { Link } from 'react-router-dom';
import clsx from 'clsx';
import ListOptionsMenu from './ListOptionsMenu';
import NoteCard from './NoteCard';
import Spinner from './Spinner';
import { SearchIcon, StarIcon } from './icons';
import { groupByDay } from '../utils/date';

export default function NoteList({
  notes,
  loading,
  firstLoad,
  error,
  search,
  pinnedOnly,
  onTogglePinnedOnly,
  sortValue,
  onChangeSort,
  previewSize,
  onChangePreviewSize,
  view,
  activeTab,
  onChangeTab,
  onTogglePin,
  onDelete,
}) {
  const stale = loading && 'notecards--stale';

  const emptyMessage = search.trim()
    ? 'No matching notes'
    : pinnedOnly
      ? 'No pinned notes'
      : view.empty;

  return (
    <section className="listpane" aria-label="Notes">
      <div className="listpane__head">
        <div className="listpane__heading">
          <h1 className="listpane__title">{pinnedOnly ? 'Pinned' : view.title}</h1>
          {view.showCount && (
            <p className="listpane__count">
              <strong>{notes.length}</strong> Notes
            </p>
          )}
        </div>
        <div className="listpane__tools">
          {view.tools.includes('pinned') && (
            <button
              type="button"
              className={clsx('iconbtn', pinnedOnly && 'iconbtn--on')}
              aria-label="Show pinned notes only"
              aria-pressed={pinnedOnly}
              onClick={onTogglePinnedOnly}
            >
              <StarIcon width={24} height={24} />
            </button>
          )}
          {view.tools.includes('search') && (
            <Link to="/search" className="iconbtn" aria-label="Search notes">
              <SearchIcon width={22} height={22} />
            </Link>
          )}
          <ListOptionsMenu
            sortValue={sortValue}
            onChangeSort={onChangeSort}
            previewSize={previewSize}
            onChangePreviewSize={onChangePreviewSize}
            isSharedView={view.title === 'Shared'}
          />
        </div>
      </div>

      {view.tabs && (
        <div className={`listtabs listtabs--${view.tabStyle}`} role="tablist" aria-label={`${view.title} filters`}>
          {view.tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={tab === activeTab}
              className={clsx('listtab', tab === activeTab && 'listtab--on')}
              onClick={() => onChangeTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      )}


      <div className="listpane__scroll">
        {error && (
          <p className="listpane__note" role="alert">
            {error}
          </p>
        )}

        {firstLoad && <Spinner label="Loading notes..." />}

        {!firstLoad && notes.length === 0 && !error && (
          pinnedOnly && !search.trim() ? (
            <blockquote className="listpane__quote">
              <p>It is never too late to be what you might have been.</p>
              <cite>George Eliot</cite>
            </blockquote>
          ) : (
            <p className="listpane__note" style={{ fontSize: view.emptySize }}>
              {emptyMessage}
            </p>
          )
        )}

        {/* the small cards have no timestamp, so group them under date headings */}
        {notes.length > 0 &&
          (previewSize === 'small' ? (
            groupByDay(notes).map((group) => (
              <div key={group.heading} className="notegroup">
                <h2 className="notegroup__heading">{group.heading}</h2>
                <ul className={clsx('notecards notecards--small', stale)}>
                  {group.notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onTogglePin={onTogglePin}
                      onDelete={onDelete}
                    />
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <ul className={clsx(`notecards notecards--${previewSize}`, stale)}>
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} onTogglePin={onTogglePin} onDelete={onDelete} />
              ))}
            </ul>
          ))}
      </div>
    </section>
  );
}
