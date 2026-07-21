import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page not-found">
      <h1>Page not found</h1>
      <p className="muted">That link doesn’t lead anywhere.</p>
      <Link to="/" className="btn btn--primary">
        Back to dashboard
      </Link>
    </div>
  );
}
