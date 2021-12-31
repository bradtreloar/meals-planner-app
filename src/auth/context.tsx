import React, {useContext, createContext, useCallback, useEffect} from 'react';
import * as firebaseAuth from 'src/firebase/auth';
import {User} from 'src/auth/types';
import {AuthSignInError, AuthSignOutError} from 'src/firebase/types';

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

  const refreshUser = useCallback(
    (currentUser: User | null) => {
      setUser(currentUser);
      if (!userInitialised) {
        setUserInitialised(true);
      }
    },
    [setUser, userInitialised],
  );

  const login = async (email: string, password: string) => {
    try {
      await firebaseAuth.login(email, password);
    } catch (error: any) {
      switch (error.code as AuthSignInError) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          throw new Error('The email or password is incorrect.');
        case 'auth/user-disabled':
          throw new Error(`The account for ${email} has been disabled.`);
        case 'auth/invalid-email':
          throw new Error('The email address is invalid.');
        default:
          throw new Error('Unable to login. An error has occurred.');
      }
    }
  };

  const logout = async () => {
    try {
      await firebaseAuth.logout();
    } catch (error: any) {
      switch (error.code as AuthSignOutError) {
        case 'auth/null-useRef':
          throw new Error('User is not logged in.');
        default:
          throw new Error('Unable to logout. An error has occurred.');
      }
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await firebaseAuth.forgotPassword(email);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  const setPassword = async (password: string) => {
    try {
      await firebaseAuth.setPassword(password);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

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

  // Subscribe to changes in authentication statue
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
