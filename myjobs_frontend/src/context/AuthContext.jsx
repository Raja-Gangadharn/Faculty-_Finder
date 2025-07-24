import { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole, logout as authLogout } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isFaculty: false,
    isRecruiter: false,
    isVerified: false,
    userId: null,
    email: '',
    firstName: '',
    lastName: '',
    isLoading: true,
  });

  // Initialize auth state on load
  useEffect(() => {
    const initializeAuth = () => {
      const userData = getUserRole();
      setAuthState({
        ...userData,
        isLoading: false,
      });
    };

    initializeAuth();

    // Sync between browser tabs
    const handleStorageChange = () => {
      initializeAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Login function
  const login = (userData) => {
    const savedData = {
      isAuthenticated: true,
      isFaculty: userData.is_faculty || false,
      isRecruiter: userData.is_recruiter || false,
      isVerified: userData.is_verified || false,
      userId: userData.id,
      email: userData.email,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
    };

    // Save to localStorage
    setUserRole(savedData);

    // Set to context state
    setAuthState({
      ...savedData,
      isLoading: false,
    });
  };

  // Logout function
  const logout = () => {
    setAuthState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    authLogout(); // remove from localStorage

    setAuthState({
      isAuthenticated: false,
      isFaculty: false,
      isRecruiter: false,
      isVerified: false,
      userId: null,
      email: '',
      firstName: '',
      lastName: '',
      isLoading: false,
    });
  };

  const updateUser = (userData) => {
    setAuthState((prev) => ({
      ...prev,
      ...userData,
    }));
  };

  const verifyEmail = () => {
    setAuthState((prev) => ({
      ...prev,
      isVerified: true,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        verifyEmail,
      }}
    >
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
