import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EditorEmpty from '../../pages/EditorEmpty';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EditorEmpty', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders quick start buttons and title', () => {
    render(
      <MemoryRouter>
        <EditorEmpty />
      </MemoryRouter>
    );

    expect(screen.getByText('Start jotting down your ideas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Write' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'To Do' })).toBeInTheDocument();
  });

  it('navigates to /notes/new when Write button is clicked', async () => {
    render(
      <MemoryRouter>
        <EditorEmpty />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Write' }));
    expect(mockNavigate).toHaveBeenCalledWith('/notes/new');
  });

  it('navigates to /notes/new?type=todo when To Do button is clicked', async () => {
    render(
      <MemoryRouter>
        <EditorEmpty />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: 'To Do' }));
    expect(mockNavigate).toHaveBeenCalledWith('/notes/new?type=todo');
  });
});
