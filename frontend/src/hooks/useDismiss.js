import { useEffect, useRef } from 'react';

export default function useDismiss(ref, open, close) {
  const onClose = useRef(close);
  onClose.current = close;

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) onClose.current();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose.current();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, open]);
}
