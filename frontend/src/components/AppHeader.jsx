import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import Menu from './Menu';
import SettingsDrawer from './SettingsDrawer';
import UserMenu from './UserMenu';
import {
  AttachIcon,
  AudioIcon,
  CaptureIcon,
  ChevronDownIcon,
  DrawIcon,
  SettingsIcon,
  TodoIcon,
  VideoIcon,
  WriteIcon,
} from './icons';

export default function AppHeader() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand" aria-label="All notes">
        <Brand />
      </Link>

      <div className="topbar__actions">
        <div className="split">
          <button
            type="button"
            className="split__main"
            onClick={() => navigate('/notes/new')}
          >
            <WriteIcon width={16} height={16} />
            <span>Write</span>
          </button>
          <Menu
            label="More note types"
            icon={ChevronDownIcon}
            triggerClass="split__caret"
            items={[
              { key: 'write', label: 'Write', icon: WriteIcon, onSelect: () => navigate('/notes/new') },
              { separator: true },
              { key: 'capture', label: 'Capture', icon: CaptureIcon, disabled: true },
              { key: 'todo', label: 'To Do', icon: TodoIcon, disabled: true },
              { key: 'attach', label: 'Attach', icon: AttachIcon, disabled: true },
              { key: 'draw', label: 'Draw', icon: DrawIcon, disabled: true },
              { key: 'audio', label: 'Audio', icon: AudioIcon, disabled: true },
              { key: 'video', label: 'Video', icon: VideoIcon, disabled: true },
            ]}
          />
        </div>

        <button
          type="button"
          className="iconbtn"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </button>

        <UserMenu />
      </div>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
