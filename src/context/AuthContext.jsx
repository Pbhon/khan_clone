import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // subscribeToAuthChanges mirrors Firebase's onAuthStateChanged — when
    // you wire up Firebase, authService is the only file that changes.
    const unsubscribe = authService.subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    return authService.login({ email, password });
  }

  async function signup(name, email, password, role, adminCode) {
    return authService.signup({ name, email, password, role, adminCode });
  }

  async function logout() {
    return authService.logout();
  }

  const value = {
    currentUser,
    authLoading,
    isAdmin: currentUser?.role === 'admin',
    isStudent: currentUser?.role === 'student',
    login,
    signup,
    logout,
  };

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-mark">LearnHub</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
