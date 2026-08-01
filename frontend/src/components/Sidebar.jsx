import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import CollectionGroup from './CollectionGroup';
import { NotesIcon, ReminderIcon, SearchIcon, SharedIcon, TrashIcon } from './icons';

const rowClass = ({ isActive }) => clsx('navrow', isActive && 'navrow--active');

export default function Sidebar() {
  return (
    <aside className="rail">
      <div className="rail__scroll">
        <NavLink to="/search" className={rowClass}>
          <SearchIcon />
          <span>Search</span>
        </NavLink>

        <nav className="rail__group" aria-label="Views">
          <NavLink to="/" end className={rowClass}>
            <NotesIcon />
            <span>All Notes</span>
          </NavLink>
          <NavLink to="/shared" className={rowClass}>
            <SharedIcon />
            <span>Shared</span>
          </NavLink>
          <NavLink to="/reminders" className={rowClass}>
            <ReminderIcon />
            <span>Reminders</span>
          </NavLink>
        </nav>

        <CollectionGroup kind="notebooks" title="Notebooks" routeBase="/notebooks" />
        <CollectionGroup kind="boards" title="Boards" routeBase="/boards" />

        <section className="rail__group">
          <div className="rail__label">
            <span>Tags</span>
          </div>
          <p className="rail__empty">No Tags Available</p>
        </section>
      </div>

      <div className="rail__foot">
        <NavLink to="/trash" className={rowClass}>
          <TrashIcon />
          <span>Trash</span>
        </NavLink>
      </div>
    </aside>
  );
}
