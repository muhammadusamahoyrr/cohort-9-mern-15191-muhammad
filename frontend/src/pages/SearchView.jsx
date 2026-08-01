import NoteCard from '../components/NoteCard';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/icons';

// with no query we show these plus recent notes, typing swaps in results
const OPTIONS = [
  ['Title', 'Search by title'],
  ['Content', 'Search by content'],
  ['Notebooks', 'Search within notebooks'],
  ['Tags', 'Filter notes using tags'],
  ['Collaborators', 'Search by collaborators'],
];

export default function SearchView({ notes, loading, search, setSearch, onTogglePin, onDelete }) {
  const query = search.trim();

  return (
    <section className="search" aria-label="Search">
      <div className="search__field">
        <SearchIcon width={20} height={20} />
        <input
          type="search"
          value={search}
          autoFocus
          placeholder="Search"
          aria-label="Search notes"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {query ? (
        <div className="search__results">
          {loading && <Spinner label="Searching..." />}
          {!loading && notes.length === 0 && (
            <p className="search__none">{`No notes match "${query}".`}</p>
          )}
          {notes.length > 0 && (
            <ul className="search__cards">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} onTogglePin={onTogglePin} onDelete={onDelete} />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <h2 className="search__heading search__heading--muted">Search Options</h2>
          <dl className="searchopts">
            {OPTIONS.map(([label, hint]) => (
              <div key={label} className="searchopts__row">
                <dt>{label} :</dt>
                <dd>{hint}</dd>
              </div>
            ))}
          </dl>

          <h2 className="search__heading">Recent notes</h2>
          <ul className="search__cards search__cards--recent">
            {notes.slice(0, 8).map((note) => (
              <NoteCard key={note.id} note={note} onTogglePin={onTogglePin} onDelete={onDelete} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
