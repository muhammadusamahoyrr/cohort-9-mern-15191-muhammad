/**
 * A sheet with three ruled lines and one stroke of writing across the first —
 * the same margin rule the rest of the app is built on, drawn rather than
 * styled. Empty screens are an invitation to act, so one always ships with a
 * primary action.
 */
function RuledSheet() {
  return (
    <svg width="88" height="104" viewBox="0 0 88 104" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="87" height="103" rx="3" stroke="currentColor" />
      <line x1="20" y1="0" x2="20" y2="104" stroke="var(--red-pen)" strokeOpacity="0.35" />
      <line x1="32" y1="34" x2="72" y2="34" stroke="currentColor" strokeWidth="1" />
      <line x1="32" y1="52" x2="72" y2="52" stroke="currentColor" strokeWidth="1" />
      <line x1="32" y1="70" x2="56" y2="70" stroke="currentColor" strokeWidth="1" />
      {/* the stroke of handwriting */}
      <path
        d="M32 34c6-7 9 5 14-1s7 4 13-2"
        stroke="var(--ink-blue)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EmptyState({ title, body, children }) {
  return (
    <div className="sheet empty">
      <RuledSheet />
      <h2>{title}</h2>
      <p>{body}</p>
      {children}
    </div>
  );
}
