import { useEffect, useState } from 'react';
import Avatar from '../components/Avatar';
import LogoutButton from '../components/LogoutButton';
import Spinner from '../components/Spinner';
import * as notesApi from '../api/notes.api';
import useAuth from '../hooks/useAuth';
import { formatDateTime } from '../utils/date';

export default function Profile() {
  const { user } = useAuth();
  const [noteCount, setNoteCount] = useState(null);

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

  if (!user) {
    return <Spinner label="Loading your profile…" />;
  }

  return (
    <>
      <div className="page__header">
        <h1>Profile</h1>
      </div>

      <div className="sheet profile">
        <div className="profile__head">
          <Avatar name={user.name} />
          <div>
            <h2 className="profile__name">{user.name}</h2>
            <p className="profile__email">{user.email}</p>
          </div>
        </div>

        <dl className="profile__rows">
          <div className="profile__row">
            <dt>Notes written</dt>
            <dd className="profile__stat">{noteCount === null ? '—' : noteCount}</dd>
          </div>
          <div className="profile__row">
            <dt>Writing since</dt>
            <dd>{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>

        <LogoutButton />
      </div>
    </>
  );
}
