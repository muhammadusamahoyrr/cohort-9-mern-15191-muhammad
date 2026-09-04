import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppHeader from '../../components/AppHeader';
import useAuth from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AppHeader', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useAuth.mockReturnValue({
      user: { name: 'Sara Khan', email: 'sara@example.com' },
      logout: jest.fn(),
    });
  });

  it('renders brand and Write button', () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'All notes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Write' })).toBeInTheDocument();
  });

  it('navigates to /notes/new when Write button is clicked', async () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Write' }));
    expect(mockNavigate).toHaveBeenCalledWith('/notes/new');
  });

  it('navigates to /notes/new?type=todo from dropdown menu', async () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: 'More note types' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'To Do' }));

    expect(mockNavigate).toHaveBeenCalledWith('/notes/new?type=todo');
  });
});
