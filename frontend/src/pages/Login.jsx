import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';

export default function Login() {
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in — don't show the form at all.
  if (loading) return <Spinner label="Checking your session…" />;
  if (token) return <Navigate to="/" replace />;

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Enter your email address';
    if (!form.password) errors.password = 'Enter your password';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      // Send the user back to whatever ProtectedRoute interrupted.
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__brand">
        <span className="wordmark">
          Margin<span>.</span>
        </span>
        <p className="auth__tagline">Somewhere to put it down.</p>
      </div>

      <div className="sheet auth__card">
        <h1>Welcome back</h1>
        <p className="auth__intro">Log in to pick up where you left off.</p>

        {formError && (
          <div className="alert" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`field${fieldErrors.email ? ' field--invalid' : ''}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
          </div>

          <div className={`field${fieldErrors.password ? ' field--invalid' : ''}`}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={update('password')}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? <Spinner inline label="Logging in" /> : 'Log in'}
          </button>
        </form>

        <p className="auth__footer">
          No account yet? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
