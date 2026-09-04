import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar';
import LogoutButton from '../components/LogoutButton';
import Spinner from '../components/Spinner';
import * as notesApi from '../api/notes.api';
import useAuth from '../hooks/useAuth';
import { formatDateTime } from '../utils/date';

export default function Profile() {
  const { user } = useAuth();
  const [noteCount, setNoteCount] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const fetchNoteCount = () => {
    notesApi
      .listNotes({ limit: 1 })
      .then((data) => {
        setNoteCount(data.pagination.total);
      })
      .catch(() => {
        setNoteCount(null);
      });
  };

  useEffect(() => {
    let cancelled = false;
    notesApi
      .listNotes({ limit: 1 })
      .then((data) => {
        if (!cancelled) setNoteCount(data.pagination.total);
      })
      .catch(() => {
        if (!cancelled) setNoteCount(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async () => {
    setStatusMessage('');
    setErrorMessage('');
    setExporting(true);
    try {
      const data = await notesApi.exportNotes();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `notes-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatusMessage(`Exported ${data.count} note(s) successfully.`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to export notes.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    setStatusMessage('');
    setErrorMessage('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const fileText = await file.text();
      const parsed = JSON.parse(fileText);
      const notesToImport = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.notes)
          ? parsed.notes
          : null;

      if (!notesToImport || !notesToImport.length) {
        throw new Error('No valid notes found in the selected JSON file.');
      }

      const result = await notesApi.importNotes(notesToImport);
      setStatusMessage(`Imported ${result.importedCount} note(s) successfully!`);
      fetchNoteCount();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to import notes. Check the JSON file format.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return <Spinner label="Loading your profile..." />;
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

        <div className="profile__section">
          <h2 className="profile__section-title">Data Management</h2>
          <p className="profile__section-desc">
            Export all your notes to a portable JSON backup file, or restore notes from a previous backup.
          </p>

          {statusMessage && (
            <div className="alert alert--success">
              {statusMessage}
            </div>
          )}
          {errorMessage && (
            <div className="alert" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="profile__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleExport}
              disabled={exporting || importing}
            >
              {exporting ? <Spinner inline label="Exporting" /> : 'Export Notes (JSON)'}
            </button>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleImportClick}
              disabled={exporting || importing}
            >
              {importing ? <Spinner inline label="Importing" /> : 'Import Notes (JSON)'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="visually-hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="profile__footer">
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
