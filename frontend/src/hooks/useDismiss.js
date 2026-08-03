import { useEffect, useRef } from 'react';

/**
 * Closes a popover when you click outside it or press Escape.
 * Pass the wrapper element's ref, whether the popover is open, and what to run
 * to close it.
 *
 * @param {import('react').RefObject<HTMLElement>} ref  wrapper element
 * @param {boolean} open   listeners only bind while this is true
 * @param {() => void} close
 * @returns {void}
 */
export default function useDismiss(ref, open, close) {
  // Callers pass an inline arrow, so keep the latest one in a ref rather than
  // rebinding both listeners on every render.
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
