import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

function Boom() {
  throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders its children when nothing goes wrong', () => {
    render(
      <ErrorBoundary>
        <p>the app</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('the app')).toBeInTheDocument();
  });

  it('shows a recovery screen instead of a blank page when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'Something broke' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });
});
