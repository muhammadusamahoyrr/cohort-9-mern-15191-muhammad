import { useEffect, useRef } from 'react';
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
    // hand focus back to whatever opened us, or keyboard users end up at the
    // top of the document
    const opener = document.activeElement;
    confirmRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
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
      // backdrop clicks dismiss, but not a drag that started inside the dialog
      // and drifted out while selecting text
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
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
