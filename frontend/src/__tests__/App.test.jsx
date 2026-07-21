import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import useAuth from '../hooks/useAuth';

jest.mock('../hooks/useAuth');

// The pages have their own suites; this one is about the route table, so each
// screen is reduced to a marker.
const stub = (label) => ({
  __esModule: true,
  default: () => require('react').createElement('p', null, label),
});

jest.mock('../pages/Dashboard', () => stub('dashboard'));
jest.mock('../pages/NoteEditor', () => stub('editor'));
jest.mock('../pages/Profile', () => stub('profile'));
jest.mock('../pages/Login', () => stub('login'));
jest.mock('../pages/Register', () => stub('register'));

const renderAt = (route, session = { token: 'abc.123', loading: false }) => {
  useAuth.mockReturnValue({ user: { name: 'Ada Lovelace' }, logout: jest.fn(), ...session });

  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );
};

describe('routes', () => {
  it.each([
    ['/', 'dashboard'],
    ['/notes/new', 'editor'],
    ['/notes/5', 'editor'],
    ['/profile', 'profile'],
  ])('renders %s for a signed-in user', (route, expected) => {
    renderAt(route);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it.each([
    ['/login', 'login'],
    ['/register', 'register'],
  ])('leaves %s open to anonymous visitors', (route, expected) => {
    renderAt(route, { token: null, loading: false });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('keeps every signed-in screen behind the guard', () => {
    renderAt('/notes/5', { token: null, loading: false });

    expect(screen.queryByText('editor')).not.toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('still honours old /dashboard links', () => {
    renderAt('/dashboard');
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('shows the not-found page for anything else', () => {
    renderAt('/nowhere');

    expect(screen.getByRole('heading', { name: 'Nothing on this page' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to your notes' })).toHaveAttribute('href', '/');
  });

  it('gives the editor a narrower measure than the dashboard', () => {
    const { container, unmount } = renderAt('/notes/5');
    expect(container.querySelector('main')).toHaveClass('page--narrow');
    unmount();

    const dashboard = renderAt('/');
    expect(dashboard.container.querySelector('main')).not.toHaveClass('page--narrow');
  });
});
