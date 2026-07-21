import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import useAuth from '../hooks/useAuth';

/**
 * Logging out appears in two places (the user menu and the profile card) and
 * must behave identically in both, so the confirm step lives with the action
 * rather than being re-implemented at each call site.
 */
export default function LogoutButton({ className = 'btn btn--danger', label = 'Log out' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <button type="button" className={className} onClick={() => setConfirming(true)}>
        {label}
      </button>

      {confirming && (
        <ConfirmDialog
          title="Log out?"
          message="You'll need your email and password to get back in."
          confirmLabel="Log out"
          destructive
          busy={busy}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
