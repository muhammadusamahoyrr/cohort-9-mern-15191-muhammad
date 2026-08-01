import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Menu from './Menu';
import useCollections from '../hooks/useCollections';
import {
  BoardIcon,
  ChevronDownIcon,
  InfoIcon,
  LockIcon,
  MoreIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
  WriteIcon,
} from './icons';

// A rail section of notebooks or boards. Adding creates the item and jumps
// straight to it, no dialog in between.
export default function CollectionGroup({ kind, title, routeBase }) {
  const collections = useCollections();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(null);

  const items = collections[kind];
  const isNotebook = kind === 'notebooks';

  const rowClass = ({ isActive }) => clsx('navrow', isActive && 'navrow--active');

  const menuFor = (item) => [
    { key: 'info', label: 'Info', icon: InfoIcon, disabled: true },
    {
      key: 'default',
      label: `Set as default ${isNotebook ? 'Notebook' : 'Board'}`,
      icon: WriteIcon,
      disabled: true,
    },
    { key: 'rename', label: 'Rename', icon: WriteIcon, onSelect: () => setRenaming(item.id) },
    ...(isNotebook
      ? [{ key: 'cover', label: 'Change Cover', icon: BoardIcon, onSelect: () => cycleCover(item) }]
      : []),
    { key: 'lock', label: 'Lock', icon: LockIcon, disabled: true },
    { key: 'share', label: 'Share', icon: ShareIcon, disabled: true },
    { separator: true },
    {
      key: 'trash',
      label: 'Trash',
      icon: TrashIcon,
      danger: true,
      onSelect: () => collections.remove(kind, item.id),
    },
  ];

  const cycleCover = (item) => {
    const next =
      collections.covers[(collections.covers.indexOf(item.cover) + 1) % collections.covers.length];
    collections.setCover(kind, item.id, next);
  };

  return (
    <section className="rail__group">
      <div className="rail__label">
        <span>{title}</span>
        <span className="rail__labeltools">
          <button
            type="button"
            className={clsx('rail__add rail__chevron', !open && 'rail__chevron--closed')}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${title}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDownIcon width={18} height={18} />
          </button>
          <Menu label={`${title} options`} icon={MoreIcon} triggerClass="rail__add" items={[
            { key: 'sort', label: 'Sort', icon: MoreIcon, disabled: true },
          ]} />
          <button
            type="button"
            className="rail__add"
            aria-label={`New ${isNotebook ? 'notebook' : 'board'}`}
            onClick={() => {
              const item = collections.add(kind);
              navigate(`${routeBase}/${item.id}`);
            }}
          >
            <PlusIcon width={18} height={18} />
          </button>
        </span>
      </div>

      {open &&
        items.map((item) =>
          renaming === item.id ? (
            <input
              key={item.id}
              className="rail__rename"
              defaultValue={item.name}
              autoFocus
              aria-label={`Rename ${item.name}`}
              onBlur={(e) => {
                collections.rename(kind, item.id, e.target.value.trim() || 'Untitled');
                setRenaming(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') setRenaming(null);
              }}
            />
          ) : (
            <div key={item.id} className="railrow">
              <NavLink to={`${routeBase}/${item.id}`} className={rowClass}>
                {isNotebook ? (
                  <span
                    className="rail__cover"
                    style={{ '--cover': item.cover }}
                    aria-hidden="true"
                  />
                ) : (
                  <BoardIcon />
                )}
                <span className="railrow__name">{item.name}</span>
              </NavLink>
              <span className="railrow__menu">
                <Menu label={`Options for ${item.name}`} icon={MoreIcon} items={menuFor(item)} />
              </span>
            </div>
          )
        )}
    </section>
  );
}
