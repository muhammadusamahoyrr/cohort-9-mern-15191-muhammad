import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import useAuth from '../hooks/useAuth';

export default function LogoutButton({ className = 'btn btn--danger', label = 'Log out' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setConfirming(false);
    } finally {
      setBusy(false);
    }
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

LogoutButton.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
};
