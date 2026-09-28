import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    return authService.subscribeToAuthChanges((user, error = '') => {
      setCurrentUser(user);
      setAuthError(error);
      setAuthLoading(false);
    });
  }, []);

  async function login(email, password) {
    const user = await authService.login({ email, password });
    setCurrentUser(user);
    return user;
  }

  async function signup(name, email, password) {
    const user = await authService.signup({ name, email, password });
    setCurrentUser(user);
    return user;
  }

  async function logout() {
    await authService.logout();
    setCurrentUser(null);
  }

  if (authLoading) {
    return (
      <div className="app-loading" role="status">
        <div className="app-loading-mark">LearnHub</div>
        <span className="sr-only">Loading your account</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authError,
        isAdmin: currentUser?.role === 'admin',
        isStudent: currentUser?.role === 'student',
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
