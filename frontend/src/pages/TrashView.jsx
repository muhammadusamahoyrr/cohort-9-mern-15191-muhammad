// Always empty: a real trash needs a soft-delete flag on the note and the API
// doesn't have one, so deleting removes the note outright.
export default function TrashView() {
  return (
    <section className="trashview" aria-label="Trash">
      <p className="trashview__empty">Empty Trash</p>
    </section>
  );
}
