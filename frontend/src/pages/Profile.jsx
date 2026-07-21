import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import * as notesApi from '../api/notes.api';
import useAuth from '../hooks/useAuth';
import { formatDateTime } from '../utils/date';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [noteCount, setNoteCount] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // The count comes from the list endpoint's pagination block — asking for a
  // single row keeps the payload tiny.
  useEffect(() => {
    let stale = false;
    notesApi
      .listNotes({ limit: 1 })
      .then((data) => {
        if (!stale) setNoteCount(data.pagination.total);
      })
      .catch(() => {
        // A missing count isn't worth an error banner on this screen.
        if (!stale) setNoteCount(null);
      });

    return () => {
      stale = true;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return <Spinner label="Loading your profile…" />;
  }

  return (
    <>
      <div className="page__header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-card__avatar" aria-hidden="true">
          {initials(user.name)}
        </div>

        <dl className="profile-card__rows">
          <div className="profile-card__row">
            <dt>Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="profile-card__row">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="profile-card__row">
            <dt>Member since</dt>
            <dd>{formatDateTime(user.createdAt)}</dd>
          </div>
          <div className="profile-card__row">
            <dt>Notes</dt>
            <dd>{noteCount === null ? '—' : noteCount}</dd>
          </div>
        </dl>

        <button type="button" className="btn btn--danger" onClick={() => setConfirmLogout(true)}>
          Log out
        </button>
      </div>

      {confirmLogout && (
        <ConfirmDialog
          title="Log out?"
          message="You’ll need your email and password to get back in."
          confirmLabel="Log out"
          busy={loggingOut}
          destructive
          onConfirm={handleLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </>
  );
}
