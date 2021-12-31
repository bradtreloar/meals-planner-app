import React, {useContext, createContext, useCallback, useEffect} from 'react';
import * as firebaseAuth from '@app/firebase/auth';
import {User} from '@app/auth/types';

export interface AuthContextState {
  isAuthenticated: boolean;
  userInitialised: boolean;
  user: User | null;
  refreshUser: (currentUser: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  resetPassword: (
    email: string,
    token: string,
    password: string,
  ) => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextState | undefined>(
  undefined,
);

/**
 * Custom hook. Returns the auth context. Only works inside components wrapped
 * by AuthProvider.
 */
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (authContext === undefined) {
    throw new Error('AuthContext is undefined');
  }
  return authContext;
};

export const AuthProvider: React.FC = ({children}) => {
  const [userInitialised, setUserInitialised] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const isAuthenticated = user !== null;

  /**
   * Refreshes the user from the server.
   */
  const refreshUser = useCallback(
    (currentUser: User | null) => {
      setUser(currentUser);
      setUserInitialised(true);
    },
    [setUser],
  );

  /**
   * Authenticates the user.
   *
   * @param email
   * @param password
   */
  const login = async (email: string, password: string) => {
    try {
      await firebaseAuth.login(email, password);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Revokes the user's authentication.
   */
  const logout = async () => {
    try {
      await firebaseAuth.logout();
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Requests a password reset.
   */
  const forgotPassword = async (email: string) => {
    try {
      await firebaseAuth.forgotPassword(email);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Sets a new password.
   */
  const setPassword = async (password: string) => {
    try {
      await firebaseAuth.setPassword(password);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Sets a new password using a token.
   */
  const resetPassword = async (
    email: string,
    token: string,
    password: string,
  ) => {
    try {
      await firebaseAuth.resetPassword(email, token, password);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Subscribe to changes in authentication statue
   */
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(refreshUser);
    return unsubscribe;
  }, [refreshUser]);

  const value = {
    isAuthenticated,
    userInitialised,
    user,
    refreshUser,
    login,
    logout,
    forgotPassword,
    setPassword,
    resetPassword,
    error: authError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
