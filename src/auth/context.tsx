import React, {useContext, createContext, useCallback} from 'react';
import * as firebase from '@app/services/firebase';
import {User} from '@app/types';

export interface AuthContextState {
  isAuthenticated: boolean;
  userInitialised: boolean;
  user: User | null;
  refreshUser: () => Promise<void>;
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
  const refreshUser = useCallback(async () => {
    const currentUser = firebase.currentUser();
    setUser(currentUser);
  }, [setUser]);

  /**
   * Authenticates the user.
   *
   * @param email
   * @param password
   */
  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await firebase.login(email, password);
      setUser(loggedInUser);
    } catch (error: any) {
      if (error.response) {
        const {status} = error.response;
        if (status === 422) {
          throw new Error('Unrecognized email or password.');
        } else if (status === 403) {
          setUserInitialised(false);
          throw new Error('User is already logged in.');
        } else {
          console.error(error);
          throw new Error('Unable to log in. An error has occurred.');
        }
      } else {
        throw error;
      }
    }
  };

  /**
   * Revokes the user's authentication.
   */
  const logout = async () => {
    try {
      await firebase.logout();
      setUser(null);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setUserInitialised(false);
      }
    }
  };

  /**
   * Requests a password reset.
   */
  const forgotPassword = async (email: string) => {
    try {
      await firebase.forgotPassword(email);
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error('Unable to find a user with that email address.');
      }
      if (error.response?.status === 429) {
        throw new Error('Too many requests.');
      }
      throw new Error('Unable to request password reset.');
    }
  };

  /**
   * Sets a new password.
   */
  const setPassword = async (password: string) => {
    try {
      await firebase.setPassword(password);
    } catch (error: any) {
      throw new Error('Unable to set password.');
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
      await firebase.resetPassword(email, token, password);
    } catch (error: any) {
      throw new Error('Unable to reset password.');
    }
  };

  /**
   * Refreshes the user if uninitialised.
   */
  React.useEffect(() => {
    if (!userInitialised) {
      (async () => {
        try {
          await refreshUser();
          setUserInitialised(true);
        } catch (error: any) {
          if (error.isAxiosError && error.response === undefined) {
            setAuthError('The app has run into a problem.');
          }
        }
      })();
    }
  }, [userInitialised, refreshUser]);

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
