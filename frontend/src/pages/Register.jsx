import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import useAuth from '../hooks/useAuth';
import Brand from '../components/Brand';
import Spinner from '../components/Spinner';
import { extractServerFieldErrors } from '../utils/errors';

const PASSWORD_MIN = 8;

export default function Register() {
  const { register, token, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner label="Checking your session..." />;
  if (token) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const found = {};

    if (!form.name.trim()) {
      found.name = 'Tell us what to call you';
    }

    if (!form.email.trim()) {
      found.email = 'Enter your email address';
    } else if (!form.email.includes('@')) {
      found.email = "That doesn't look like an email address";
    }

    if (form.password.length < PASSWORD_MIN) {
      found.password = `Use at least ${PASSWORD_MIN} characters`;
    } else if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password)) {
      found.password = 'Include at least one letter and one number';
    }

    if (form.confirm !== form.password) {
      found.confirm = "Passwords don't match";
    }

    setErrors(found);
    return Object.keys(found).length === 0;
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
      setErrors(extractServerFieldErrors(err.details));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__brand">
        <Brand size="lg" />
        <p className="auth__tagline">Write. Organise. Keep.</p>
      </div>

      <div className="sheet auth__card">
        <h1>Start a notebook</h1>
        <p className="auth__intro">Takes about ten seconds.</p>

        {formError && (
          <div className="alert" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={clsx('field', errors.name && 'field--invalid')}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </div>

          <div className={clsx('field', errors.email && 'field--invalid')}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          <div className={clsx('field', errors.password && 'field--invalid')}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              aria-describedby="password-hint"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password ? (
              <span className="field__error">{errors.password}</span>
            ) : (
              <span id="password-hint" className="field__note">
                At least {PASSWORD_MIN} characters, with a letter and a number.
              </span>
            )}
          </div>

          <div className={clsx('field', errors.confirm && 'field--invalid')}>
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={handleChange}
              aria-invalid={Boolean(errors.confirm)}
            />
            {errors.confirm && <span className="field__error">{errors.confirm}</span>}
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
