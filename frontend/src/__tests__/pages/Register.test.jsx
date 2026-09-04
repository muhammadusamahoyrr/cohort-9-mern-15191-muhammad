import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import Register from '../../pages/Register';
import * as authApi from '../../api/auth.api';
import { renderWithRouter } from '../helpers/render';

jest.mock('../../api/auth.api');

beforeEach(() => {
  authApi.me.mockResolvedValue({ user: { id: 1, name: 'Sara Khan' } });
});

const renderRegister = () =>
  renderWithRouter(<Register />, {
    route: '/register',
    path: '/register',
    withAuth: true,
    extraRoutes: <Route path="/" element={<h1>Your notes</h1>} />,
  });

const fill = async ({ name = 'Sara Khan', email = 'sara@example.com', password, confirm }) => {
  await userEvent.type(await screen.findByLabelText('Name'), name);
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.type(screen.getByLabelText('Confirm password'), confirm ?? password);
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
};

describe('Register', () => {
  it('rejects a password shorter than the backend allows', async () => {
    renderRegister();
    await fill({ password: 'Ab1' });

    expect(screen.getByText('Use at least 8 characters')).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('requires a letter and a number in password', async () => {
    renderRegister();
    await fill({ password: 'passwordpassword' });

    expect(screen.getByText('Include at least one letter and one number')).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('validates that password and confirmation match', async () => {
    renderRegister();
    await fill({ password: 'Passw0rd', confirm: 'Passw0rdd' });

    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('registers a valid account and lands on the dashboard', async () => {
    authApi.register.mockResolvedValue({
      token: 'fresh.token',
      user: { id: 1, name: 'Sara Khan' },
    });

    renderRegister();
    await fill({ password: 'Passw0rd' });

    expect(authApi.register).toHaveBeenCalledWith({
      name: 'Sara Khan',
      email: 'sara@example.com',
      password: 'Passw0rd',
    });
    expect(await screen.findByRole('heading', { name: 'Your notes' })).toBeInTheDocument();
  });

  it('surfaces a duplicate-email rejection from the server', async () => {
    const conflict = new Error('That email is already registered');
    conflict.status = 409;
    authApi.register.mockRejectedValue(conflict);

    renderRegister();
    await fill({ password: 'Passw0rd' });

    expect(await screen.findByRole('alert')).toHaveTextContent('That email is already registered');
  });

  it('maps per-field validation details onto the fields they belong to', async () => {
    const invalid = new Error('Validation failed');
    invalid.status = 422;
    invalid.details = [{ field: 'email', message: 'Email must be a valid address' }];
    authApi.register.mockRejectedValue(invalid);

    renderRegister();
    await fill({ password: 'Passw0rd' });

    expect(await screen.findByText('Email must be a valid address')).toBeInTheDocument();
  });
});
