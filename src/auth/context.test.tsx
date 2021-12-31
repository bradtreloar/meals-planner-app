import React, {useState} from 'react';
import {Text, Button} from 'react-native';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import faker from 'faker';
import {AuthProvider, useAuth} from './context';
import {fakeUser} from './factory';
import {noop} from 'lodash';
import {User} from './types';
import * as firebase from 'src/firebase/auth';
import {AuthSignInError} from 'src/firebase/types';
jest.mock('src/firebase/auth');

const testUser = fakeUser();
const testPassword = faker.random.alphaNumeric();
const testToken = faker.random.alphaNumeric();

const AuthTestFixture = () => {
  const {isAuthenticated, login, logout, resetPassword} = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (error) {
    return <Text data-testid="error">{error}</Text>;
  }

  return isAuthenticated ? (
    <>
      <Text>User is logged in</Text>
      {message && <Text>{message}</Text>}
      <Button
        title="Log out"
        onPress={async () => {
          await logout();
        }}
      />
    </>
  ) : (
    <>
      <Text>User is not logged in</Text>
      {message && <Text>{message}</Text>}
      <Button
        title="Log in"
        onPress={async () => {
          try {
            await login(testUser.email as string, testPassword);
          } catch (loginError: any) {
            setError(loginError.message);
          }
        }}
      />
      <Button
        title="Save Password"
        onPress={async () => {
          await resetPassword(
            testUser.email as string,
            testToken,
            testPassword,
          );
          setMessage('password was reset');
        }}
      />
    </>
  );
};

let testGlobals = {
  refreshUserCallback: noop as (user: User | null) => void,
};

function triggerAuthStateChange(user: User | null) {
  act(() => {
    testGlobals.refreshUserCallback(user);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(firebase, 'onAuthStateChanged')
    .mockImplementation((refreshUserCallback: (user: User | null) => void) => {
      testGlobals.refreshUserCallback = refreshUserCallback;
      return () => undefined;
    });
});

describe('unauthenticated user', () => {
  test('user is unauthenticated', async () => {
    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });
    triggerAuthStateChange(null);

    getByText('User is not logged in');
  });

  test('user logs in successfully', async () => {
    jest.spyOn(firebase, 'login').mockImplementation(async () => {
      triggerAuthStateChange(testUser);
      return Promise.resolve(undefined);
    });

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });
    triggerAuthStateChange(null);

    await act(async () => {
      fireEvent.press(getByText(/Log in/i));
    });
    getByText(/User is logged in/);
  });

  test('invalid user fails to log in', async () => {
    const firebaseError = {
      code: 'auth/wrong-password' as AuthSignInError,
      message: faker.random.alpha(),
    };
    jest.spyOn(firebase, 'login').mockRejectedValue(firebaseError);

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });
    triggerAuthStateChange(null);

    await act(async () => {
      fireEvent.press(getByText(/Log in/i));
    });
    getByText('The email or password is incorrect.');
  });

  test('requests password reset', async () => {
    jest.spyOn(firebase, 'forgotPassword').mockResolvedValue(undefined);

    const ResetPasswordTestFixture: React.FC = () => {
      const {forgotPassword} = useAuth();
      const [message, setMessage] = useState('');

      return (
        <>
          {message && <Text>{message}</Text>}
          <Button
            title="Reset Password"
            onPress={async () => {
              await forgotPassword(testUser.email as string);
              setMessage('Request Submitted');
            }}
          />
        </>
      );
    };

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <ResetPasswordTestFixture />
        </AuthProvider>,
      );
    });
    triggerAuthStateChange(null);

    await act(async () => {
      fireEvent.press(getByText(/reset password/i));
    });
    getByText(/request submitted/i);
  });

  test('resets password using token', async () => {
    jest.spyOn(firebase, 'resetPassword').mockResolvedValue(undefined);

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });
    triggerAuthStateChange(null);

    await act(async () => {
      fireEvent.press(getByText(/save password/i));
    });
    getByText(/password was reset/i);
  });
});

describe('authenticated user', () => {
  test('user is authenticated', async () => {
    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });
    triggerAuthStateChange(testUser);

    getByText(/User is logged in/);
  });

  test('user logs out successfully', async () => {
    jest.spyOn(firebase, 'logout').mockImplementation(async () => {
      triggerAuthStateChange(null);
      return Promise.resolve(undefined);
    });

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });
    triggerAuthStateChange(testUser);

    await act(async () => {
      fireEvent.press(getByText(/Log out/));
    });
    getByText(/User is not logged in/);
  });
});
