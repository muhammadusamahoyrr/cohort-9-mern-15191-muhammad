import NoteCard from '../components/NoteCard';
import { FilterIcon, InfoIcon, MoreIcon, PlusIcon } from '../components/icons';

// Only Recents has notes behind it. The other three each need a table the API
// doesn't have, so they render empty rather than showing made-up content.
export default function BoardView({ notes, name }) {
  const columns = [
    { key: 'recents', name: 'Recents', notes },
    { key: 'lists', name: 'My Lists', notes: [] },
    { key: 'files', name: 'All Files', notes: [] },
    { key: 'reminders', name: 'My Reminders', notes: [] },
  ];

  return (
    <section className="board" aria-label={name}>
      <header className="board__head">
        <h1 className="board__title">{name}</h1>
        <div className="board__tools">
          <button type="button" className="iconbtn" aria-label="Add column" disabled>
            <PlusIcon />
          </button>
          <button type="button" className="iconbtn" aria-label="Board info" disabled>
            <InfoIcon />
          </button>
          <button type="button" className="iconbtn" aria-label="Board options" disabled>
            <MoreIcon />
          </button>
        </div>
      </header>

      <div className="board__columns">
        {columns.map((column) => (
          <section key={column.key} className="boardcol">
            <h2 className="boardcol__name">{column.name}</h2>
            <p className="boardcol__count">
              <FilterIcon width={14} height={14} />
              {column.notes.length} Notes
            </p>

            {column.notes.length === 0 ? (
              <p className="boardcol__empty">No Notecards</p>
            ) : (
              <ul className="boardcol__cards">
                {column.notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
