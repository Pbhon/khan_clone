import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Students sign up freely. Choosing "Admin" additionally requires the code
 * in src/config/adminAccess.js — open that file to read or change it, and
 * see the README's "Admin accounts" section for what this does and doesn't
 * protect against.
 */
export default function SignupPage() {
  const { currentUser, isAdmin, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await signup(name.trim(), email.trim(), password, role, adminCode);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong creating your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="page-title">Create your account</h1>
        <p className="text-muted">Start tracking your progress and earning awards.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <div className="form-hint">At least 6 characters.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Account type</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-option ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={`role-option ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                🛠️ Admin
              </button>
            </div>
          </div>

          {role === 'admin' && (
            <div className="form-group">
              <label className="form-label" htmlFor="admin-code">
                Admin access code
              </label>
              <input
                id="admin-code"
                type="password"
                className="form-input"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter the admin access code"
                autoComplete="off"
              />
              <div className="form-hint">Ask whoever manages this app for the code.</div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : role === 'admin' ? 'Create admin account' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
