import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../../components/Navbar';
import useAuth from '../../hooks/useAuth';
import { renderWithRouter } from '../helpers/render';

jest.mock('../../hooks/useAuth');

const user = { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' };

beforeEach(() => {
  useAuth.mockReturnValue({ user, logout: jest.fn() });
});

describe('Navbar', () => {
  it('marks the current section as active', () => {
    renderWithRouter(<Navbar />, { route: '/profile', path: '/profile' });

    expect(screen.getByRole('link', { name: 'Profile' })).toHaveClass('nav__link--active');
    expect(screen.getByRole('link', { name: 'Notes' })).not.toHaveClass('nav__link--active');
  });

  it('keeps the account menu closed until it is asked for', () => {
    renderWithRouter(<Navbar />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('opens a menu with the account and a way out', async () => {
    renderWithRouter(<Navbar />);

    await userEvent.click(screen.getByRole('button', { expanded: false }));

    const menu = screen.getByRole('menu');
    expect(menu).toHaveTextContent('Ada Lovelace');
    expect(menu).toHaveTextContent('ada@example.com');
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('closes the menu on Escape', async () => {
    renderWithRouter(<Navbar />);

    await userEvent.click(screen.getByRole('button', { expanded: false }));
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu when the click lands outside it', async () => {
    renderWithRouter(<Navbar />);

    await userEvent.click(screen.getByRole('button', { expanded: false }));
    await userEvent.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders nothing for the account while the session is still loading', () => {
    useAuth.mockReturnValue({ user: null, logout: jest.fn() });

    renderWithRouter(<Navbar />);

    expect(screen.queryByRole('button', { expanded: false })).not.toBeInTheDocument();
  });
});
