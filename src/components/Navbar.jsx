import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={currentUser ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="navbar-brand">
          Learn<span>Hub</span>
        </Link>

        {currentUser && (
          <nav className="navbar-links">
            {isAdmin ? (
              <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}>
                Admin Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}>
                  Dashboard
                </NavLink>
                <NavLink to="/courses" className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}>
                  Explore Courses
                </NavLink>
                <NavLink to="/awards" className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}>
                  Awards
                </NavLink>
              </>
            )}
          </nav>
        )}

        <div className="navbar-actions">
          {currentUser ? (
            <>
              <span className="navbar-user">
                {currentUser.name}
                <span className="navbar-role-pill">{currentUser.role}</span>
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
