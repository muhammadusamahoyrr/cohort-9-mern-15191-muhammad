/** Initials in a disc — the app never asks for a photo, so this is the identity mark. */
export default function Avatar({ name = '', className = '' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span className={`avatar ${className}`.trim()} aria-hidden="true">
      {initials || '·'}
    </span>
  );
}
