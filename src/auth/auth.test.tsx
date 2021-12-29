import React, {useState} from 'react';
import {Text, Button} from 'react-native';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import faker from 'faker';
import {AuthProvider, useAuth} from './context';
import {fakeUser} from './factory';
import * as firebase from '@app/firebase/auth';
jest.mock('@app/firebase/auth');

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

beforeEach(() => {
  jest.useFakeTimers();
});

describe('unauthenticated user', () => {
  beforeEach(() => {
    jest.spyOn(firebase, 'currentUser').mockReturnValue(null);
  });

  test('user is unauthenticated', async () => {
    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });

    getByText('User is not logged in');
  });

  test('user logs in successfully', async () => {
    jest.spyOn(firebase, 'login').mockResolvedValueOnce(testUser);

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });

    await act(async () => {
      fireEvent.press(getByText(/Log in/i));
    });
    getByText(/User is logged in/);
  });

  test('invalid user fails to log in', async () => {
    const errorMessage = faker.random.alpha();
    jest.spyOn(firebase, 'login').mockRejectedValue(new Error(errorMessage));

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });

    await act(async () => {
      fireEvent.press(getByText(/Log in/i));
    });
    getByText(errorMessage);
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

    await act(async () => {
      fireEvent.press(getByText(/save password/i));
    });
    getByText(/password was reset/i);
  });
});

describe('authenticated user', () => {
  beforeEach(() => {
    jest.spyOn(firebase, 'currentUser').mockReturnValue(testUser);
  });

  test('user is authenticated', async () => {
    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });

    getByText(/User is logged in/);
  });

  test('user logs out successfully', async () => {
    jest.spyOn(firebase, 'logout').mockResolvedValue(undefined);

    const {getByText} = await waitFor(async () => {
      return render(
        <AuthProvider>
          <AuthTestFixture />
        </AuthProvider>,
      );
    });

    await act(async () => {
      fireEvent.press(getByText(/Log out/));
    });
    getByText(/User is not logged in/);
  });
});
