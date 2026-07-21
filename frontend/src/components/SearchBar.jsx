export default function SearchBar({ value, onChange, placeholder = 'Search your notes' }) {
  return (
    <div className="search">
      <label className="visually-hidden" htmlFor="note-search">
        Search notes
      </label>
      <svg
        className="search__icon"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        id="note-search"
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search__clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          ×
        </button>
      )}
    </div>
  );
}
