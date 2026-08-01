import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="sheet centered-note">
        <h1>Nothing on this page</h1>
        <p className="muted">{"That link doesn't lead anywhere in the app."}</p>
        <Link to="/" className="btn btn--primary">
          Back to your notes
        </Link>
      </div>
    </div>
  );
}
