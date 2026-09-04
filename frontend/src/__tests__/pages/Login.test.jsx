import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import Login from '../../pages/Login';
import * as authApi from '../../api/auth.api';
import { renderWithRouter } from '../helpers/render';

jest.mock('../../api/auth.api');

beforeEach(() => {
  authApi.me.mockResolvedValue({ user: { id: 1, name: 'Sara Khan' } });
});

const renderLogin = () =>
  renderWithRouter(<Login />, {
    route: '/login',
    path: '/login',
    withAuth: true,
    extraRoutes: <Route path="/" element={<h1>Your notes</h1>} />,
  });

describe('Login', () => {
  it('validates required fields without calling the API', async () => {
    renderLogin();

    await userEvent.click(await screen.findByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('submits the typed credentials and lands on the dashboard', async () => {
    authApi.login.mockResolvedValue({
      token: 'fresh.token',
      user: { id: 1, name: 'Sara Khan' },
    });

    renderLogin();

    await userEvent.type(await screen.findByLabelText('Email'), '  sara@example.com  ');
    await userEvent.type(screen.getByLabelText('Password'), 'Passw0rd');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'sara@example.com',
      password: 'Passw0rd',
    });
    expect(await screen.findByRole('heading', { name: 'Your notes' })).toBeInTheDocument();
  });

  it('shows the server error and stays on the form', async () => {
    authApi.login.mockRejectedValue(new Error('Invalid credentials'));

    renderLogin();

    await userEvent.type(await screen.findByLabelText('Email'), 'sara@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-one');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(screen.getByLabelText('Email')).toHaveValue('sara@example.com');
  });
});
