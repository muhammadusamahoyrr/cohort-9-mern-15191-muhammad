import { useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { CollaboratorIcon, FilterIcon, MoreIcon, SortIcon } from './icons';
import useDismiss from '../hooks/useDismiss';

const SORT_CYCLE = [
  { value: 'updated_at:desc', label: 'Date Modified' },
  { value: 'created_at:desc', label: 'Date Created' },
  { value: 'title:asc', label: 'Title' },
];

const FILTER_TYPES = [
  'Checklist',
  'Photo',
  'File',
  'Contact',
  'Audio',
  'Video',
  'Sketch',
  'Document',
  'Link',
];

export default function ListOptionsMenu({
  sortValue = 'updated_at:desc',
  onChangeSort,
  previewSize = 'medium',
  onChangePreviewSize,
  isSharedView = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // null | 'filter' | 'collaborators'
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const ref = useRef(null);
  const menuId = useId();

  const currentSort = SORT_CYCLE.find((s) => s.value === sortValue) ?? SORT_CYCLE[0];

  const close = () => {
    setMenuOpen(false);
    setActivePanel(null);
  };

  useDismiss(ref, menuOpen, close);

  const handleSortClick = () => {
    const i = SORT_CYCLE.findIndex((s) => s.value === sortValue);
    onChangeSort?.(SORT_CYCLE[(i + 1) % SORT_CYCLE.length].value);
    setMenuOpen(false);
  };

  const toggleFilter = (type) => {
    setSelectedFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="iconbtn"
        aria-label="List options"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? menuId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((v) => !v);
          setActivePanel(null);
        }}
      >
        <MoreIcon width={18} height={18} />
      </button>

      {menuOpen && (
        <div id={menuId} className="menu__panel menu__panel--right" role="menu">
          {activePanel === null && (
            <>
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={handleSortClick}
              >
                <SortIcon width={16} height={16} />
                <span>{currentSort.label}</span>
              </button>

              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => setActivePanel('filter')}
              >
                <FilterIcon width={16} height={16} />
                <span>Filter</span>
              </button>

              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => setActivePanel('collaborators')}
              >
                <CollaboratorIcon width={16} height={16} />
                <span>Choose Collaborators</span>
              </button>

              {!isSharedView && (
                <>
                  <hr className="menu__rule" />
                  <p className="menu__heading">Preview Size</p>
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      role="menuitem"
                      className={clsx('menu__item', previewSize === size && 'menu__item--checked')}
                      onClick={() => {
                        onChangePreviewSize?.(size);
                        setMenuOpen(false);
                      }}
                    >
                      <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    </button>
                  ))}
                </>
              )}
            </>
          )}

          {/* Popover: Filter */}
          {activePanel === 'filter' && (
            <div className="popover-card">
              <div className="popover-card__body">
                {FILTER_TYPES.map((type) => (
                  <label key={type} className="popover-card__checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(type)}
                      onChange={() => toggleFilter(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              <div className="popover-card__footer">
                <button
                  type="button"
                  className="popover-card__btn popover-card__btn--clear"
                  onClick={() => setSelectedFilters([])}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="popover-card__btn popover-card__btn--apply"
                  onClick={close}
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Popover: Choose Collaborators */}
          {activePanel === 'collaborators' && (
            <div className="popover-card popover-card--collaborators">
              <h3 className="popover-card__title">Choose Collaborators</h3>
              <input
                type="search"
                className="popover-card__search"
                placeholder="Search"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
              <div className="popover-card__empty">No Collaborators</div>
              <div className="popover-card__footer">
                <button
                  type="button"
                  className="popover-card__btn popover-card__btn--clear"
                  onClick={() => setFilterSearch('')}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="popover-card__btn popover-card__btn--apply"
                  onClick={close}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
