export default function SearchBar({ value, onChange, placeholder = 'Search notes…' }) {
  return (
    <div className="search">
      <label className="visually-hidden" htmlFor="note-search">
        Search notes
      </label>
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
