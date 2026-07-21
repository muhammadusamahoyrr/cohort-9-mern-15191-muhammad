import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import LogoutButton from './LogoutButton';
import useAuth from '../hooks/useAuth';

export default function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="usermenu" ref={wrapRef}>
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
