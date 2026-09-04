import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UserMenu from '../../components/UserMenu';
import useAuth from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth');

describe('UserMenu', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { name: 'Sara Khan', email: 'sara@example.com' },
      logout: jest.fn(),
    });
  });

  it('renders avatar button for signed in user', () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Account menu for Sara Khan/ })).toBeInTheDocument();
  });

  it('opens menu with user identity and navigation links', async () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /Account menu for Sara Khan/ }));

    expect(screen.getByText('Sara Khan')).toBeInTheDocument();
    expect(screen.getByText('sara@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
  });

  it('returns null when user is not present', () => {
    useAuth.mockReturnValue({ user: null });
    const { container } = render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
