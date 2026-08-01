import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  destructive = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    confirmRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [onCancel]);

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="sheet dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={clsx('btn', destructive ? 'btn--danger-solid' : 'btn--primary')}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  busy: PropTypes.bool,
  destructive: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

