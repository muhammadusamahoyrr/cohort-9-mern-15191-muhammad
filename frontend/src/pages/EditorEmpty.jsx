import { useNavigate } from 'react-router-dom';
import { TodoIcon, WriteIcon } from '../components/icons';

const ACTIONS = [
  { key: 'write', label: 'Write', Icon: WriteIcon, to: '/notes/new' },
  { key: 'todo', label: 'To Do', Icon: TodoIcon, to: '/notes/new?type=todo' },
];

export default function EditorEmpty() {
  const navigate = useNavigate();

  return (
    <div className="editor-empty">
      <h2 className="editor-empty__title">Start jotting down your ideas</h2>

      <div className="editor-empty__grid">
        {ACTIONS.map(({ key, label, Icon, to }) => (
          <button key={key} type="button" className="tile" onClick={() => navigate(to)}>
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
