import { Link, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const linkClass = ({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label="Main">
        <Link to="/" className="navbar__brand">
          Notes
        </Link>

        <div className="navbar__links">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            {user?.name?.split(' ')[0] ?? 'Profile'}
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
