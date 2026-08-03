import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import LogoutButton from './LogoutButton';
import useAuth from '../hooks/useAuth';
import useDismiss from '../hooks/useDismiss';

export default function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useDismiss(ref, open, () => setOpen(false));

  if (!user) return null;

  return (
    <div className="usermenu" ref={ref}>
      <button
        type="button"
        className="usermenu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar name={user.name} />
        <span className="visually-hidden">Account menu for {user.name}</span>
        <span className="usermenu__caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="usermenu__panel" role="menu">
          <div className="usermenu__identity">
            <div className="usermenu__name">{user.name}</div>
            <div className="usermenu__email">{user.email}</div>
          </div>

          <Link
            to="/profile"
            className="usermenu__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <LogoutButton className="usermenu__item usermenu__item--danger" />
        </div>
      )}
    </div>
  );
}
