import { Link, NavLink } from 'react-router-dom';
import UserMenu from './UserMenu';

const linkClass = ({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`;

export default function Navbar() {
  return (
    <header className="nav">
      <nav className="nav__inner" aria-label="Main">
        <Link to="/" className="wordmark">
          Margin<span>.</span>
        </Link>

        <div className="nav__links">
          <NavLink to="/" end className={linkClass}>
            Notes
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </div>

        <UserMenu />
      </nav>
    </header>
  );
}
