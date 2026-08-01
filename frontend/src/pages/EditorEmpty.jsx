import { useNavigate } from 'react-router-dom';
import {
  AttachIcon,
  AudioIcon,
  CaptureIcon,
  DrawIcon,
  TodoIcon,
  VideoIcon,
  WriteIcon,
} from '../components/icons';

// Laid out 3 / 3 / 1 so the last tile centres under the block.
const ACTIONS = [
  { key: 'write', label: 'Write', Icon: WriteIcon, to: '/notes/new' },
  { key: 'capture', label: 'Capture', Icon: CaptureIcon, to: '/notes/new?type=capture' },
  { key: 'todo', label: 'To Do', Icon: TodoIcon, to: '/notes/new?type=todo' },
  { key: 'attach', label: 'Attach', Icon: AttachIcon, to: '/notes/new?type=attach' },
  { key: 'draw', label: 'Draw', Icon: DrawIcon, to: '/notes/new?type=draw' },
  { key: 'audio', label: 'Audio', Icon: AudioIcon, to: '/notes/new?type=audio' },
  { key: 'video', label: 'Video', Icon: VideoIcon, to: '/notes/new?type=video' },
];

/** Shown in the right pane whenever no note is open. */
export default function EditorEmpty() {
  const navigate = useNavigate();

  return (
    <div className="editor-empty">
      <h2 className="editor-empty__title">Start jotting down your ideas</h2>

      <div className="editor-empty__grid">
        {ACTIONS.map(({ key, label, Icon, to }) => (
          <button
            key={key}
            type="button"
            className="tile"
            disabled={!to}
            onClick={to ? () => navigate(to) : undefined}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
