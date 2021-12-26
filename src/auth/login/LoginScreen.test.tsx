import React from 'react';
import {
  fireEvent,
  render,
  RenderAPI,
  waitFor,
} from '@testing-library/react-native';
import faker from 'faker';
import LoginScreen from './LoginScreen';
import * as authContext from '../context';
import {noop} from 'lodash';
import {act} from 'react-test-renderer';
import {fakeUser} from '../factory';
jest.mock('../context');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.useRealTimers();
});

function fillForm(context: RenderAPI, email: string, password: string) {
  const {getByLabelText} = context;
  fireEvent.changeText(getByLabelText(/email address/i), email);
  fireEvent.changeText(getByLabelText(/password/i), password);
}

const mockUseAuth = (): authContext.AuthContextState => ({
  user: null,
  userInitialised: true,
  isAuthenticated: false,
  login: jest.fn(),
  error: null,
  forgotPassword: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
  setPassword: jest.fn(),
  resetPassword: jest.fn(),
});

it('calls the submit handler when the LoginForm is submitted', async () => {
  const testEmail = faker.internet.email();
  const testPassword = faker.internet.password();
  const authContextState = mockUseAuth();
  jest.spyOn(authContext, 'useAuth').mockReturnValue(authContextState);
  const context = await waitFor(async () =>
    render(<LoginScreen navigation={noop} screenProps={{}} theme={{}} />),
  );

  fillForm(context, testEmail, testPassword);
  fireEvent.press(context.getByTestId('login-form-submit-button'));
  expect(authContextState.login).toHaveBeenCalledWith(testEmail, testPassword);
});

it('displays an error when the form submission fails', async () => {
  const testEmail = faker.internet.email();
  const testPassword = faker.internet.password();
  const testErrorMessage = 'login failed';
  const authContextState = mockUseAuth();
  jest.spyOn(authContext, 'useAuth').mockReturnValue(authContextState);
  jest.spyOn(authContextState, 'login').mockRejectedValue({
    message: testErrorMessage,
  });
  const context = await waitFor(async () =>
    render(<LoginScreen navigation={noop} screenProps={{}} theme={{}} />),
  );

  fillForm(context, testEmail, testPassword);
  await act(async () => {
    fireEvent.press(context.getByTestId('login-form-submit-button'));
  });
  expect(authContextState.login).toHaveBeenCalledWith(testEmail, testPassword);
  context.getByText(testErrorMessage);
});

it('disables the login form while waiting for the login request to finish', async () => {
  const testUser = fakeUser();
  const testEmail = faker.internet.email();
  const testPassword = faker.internet.password();
  const authContextState = mockUseAuth();
  authContextState.login = async () =>
    new Promise(resolve => setTimeout(() => resolve(testUser), 2000));
  jest.spyOn(authContext, 'useAuth').mockReturnValue(authContextState);
  jest.useFakeTimers();
  const context = await waitFor(async () =>
    render(<LoginScreen navigation={noop} screenProps={{}} theme={{}} />),
  );

  fillForm(context, testEmail, testPassword);
  const loginFormSubmitButton = context.getByTestId('login-form-submit-button');
  fireEvent.press(loginFormSubmitButton);
  expect(loginFormSubmitButton.props.accessibilityLabel).toBe('Logging in');
});
