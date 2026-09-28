import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any route element with this to require login, and optionally a
 * specific role. Usage:
 *   <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const fallback = currentUser.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
