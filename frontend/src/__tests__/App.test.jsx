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

// Workspace is a layout route: it has to keep rendering its outlet, otherwise
// every nested route below it disappears from this suite.
jest.mock('../pages/Workspace', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    const { Outlet: O } = require('react-router-dom');
    return React.createElement('div', null, React.createElement('p', null, 'workspace'), React.createElement(O));
  },
}));
jest.mock('../pages/EditorEmpty', () => stub('empty'));
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
    ['/', 'empty'],
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
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('shows the not-found page for anything else', () => {
    renderAt('/nowhere');

    expect(screen.getByRole('heading', { name: 'Nothing on this page' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to your notes' })).toHaveAttribute('href', '/');
  });

  // the list pane has to survive moving between notes, which is the whole
  // reason the editor is a child route and not a page of its own
  it('keeps the workspace mounted around an open note', () => {
    renderAt('/notes/5');

    expect(screen.getByText('workspace')).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
  });
});
