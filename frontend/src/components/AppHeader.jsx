import { Link, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import Menu from './Menu';
import UserMenu from './UserMenu';
import { ChevronDownIcon, TodoIcon, WriteIcon } from './icons';

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand" aria-label="All notes">
        <Brand />
      </Link>

      <div className="topbar__actions">
        <div className="split">
          <button type="button" className="split__main" onClick={() => navigate('/notes/new')}>
            <WriteIcon width={16} height={16} />
            <span>Write</span>
          </button>
          <Menu
            label="More note types"
            icon={ChevronDownIcon}
            triggerClass="split__caret"
            items={[
              {
                key: 'write',
                label: 'Write',
                icon: WriteIcon,
                onSelect: () => navigate('/notes/new'),
              },
              {
                key: 'todo',
                label: 'To Do',
                icon: TodoIcon,
                onSelect: () => navigate('/notes/new?type=todo'),
              },
            ]}
          />
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
