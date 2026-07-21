import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';

// Mirrors the backend rule in docs/03-API.md: 8+ chars, at least a letter and a digit.
const PASSWORD_MIN = 8;
const hasLetter = (value) => /[a-zA-Z]/.test(value);
const hasDigit = (value) => /\d/.test(value);

/** Turns a 422 `details` array into { field: message } when the server sends one. */
function toFieldErrors(details) {
  if (!Array.isArray(details)) return {};
  return details.reduce((acc, item) => {
    const field = item.field ?? item.path;
    if (field && !acc[field]) acc[field] = item.message;
    return acc;
  }, {});
}

export default function Register() {
  const { register, token, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner label="Checking your session…" />;
  if (token) return <Navigate to="/" replace />;

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = 'Tell us what to call you';
    }
    if (!form.email.trim()) {
      errors.email = 'Enter your email address';
    } else if (!form.email.includes('@')) {
      // Deliberately loose — the server owns the real rule, this only catches typos.
      errors.email = 'That doesn’t look like an email address';
    }
    if (form.password.length < PASSWORD_MIN) {
      errors.password = `Use at least ${PASSWORD_MIN} characters`;
    } else if (!hasLetter(form.password) || !hasDigit(form.password)) {
      errors.password = 'Include at least one letter and one number';
    }
    if (form.confirm !== form.password) {
      errors.confirm = 'Passwords don’t match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setFieldErrors(toFieldErrors(err.details));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Create an account</h1>
        <p className="auth__subtitle">It takes about ten seconds.</p>

        {formError && (
          <div className="alert alert--error" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`field${fieldErrors.name ? ' field--invalid' : ''}`}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && <span className="field__error">{fieldErrors.name}</span>}
          </div>

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
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              aria-describedby="password-hint"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password ? (
              <span className="field__error">{fieldErrors.password}</span>
            ) : (
              <span id="password-hint" className="muted" style={{ fontSize: '0.8rem' }}>
                At least {PASSWORD_MIN} characters, with a letter and a number.
              </span>
            )}
          </div>

          <div className={`field${fieldErrors.confirm ? ' field--invalid' : ''}`}>
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={update('confirm')}
              aria-invalid={Boolean(fieldErrors.confirm)}
            />
            {fieldErrors.confirm && <span className="field__error">{fieldErrors.confirm}</span>}
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? <Spinner inline label="Creating your account" /> : 'Create account'}
          </button>
        </form>

        <p className="auth__footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
