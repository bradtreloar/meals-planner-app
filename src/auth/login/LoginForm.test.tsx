import React from 'react';
import {
  fireEvent,
  render,
  RenderAPI,
  waitFor,
} from '@testing-library/react-native';
import {noop} from 'lodash';
import faker from 'faker';
import LoginForm from './LoginForm';

function fillForm(context: RenderAPI, email: string, password: string) {
  const {getByLabelText} = context;
  fireEvent.changeText(getByLabelText(/email address/i), email);
  fireEvent.changeText(getByLabelText(/password/i), password);
}

it('accepts user input', async () => {
  const testEmail = faker.internet.email();
  const testPassword = faker.internet.password();

  const {getByLabelText} = await waitFor(async () =>
    render(<LoginForm onSubmit={noop} />),
  );

  const emailInput = getByLabelText(/email address/i);
  fireEvent.changeText(emailInput, testEmail);
  expect(emailInput.props.value).toEqual(testEmail);

  const passwordInput = getByLabelText(/password/i);
  fireEvent.changeText(passwordInput, testPassword);
  expect(passwordInput.props.value).toEqual(testPassword);
});

it('calls the onSubmit handler when the user presses the submit button', async () => {
  const testEmail = faker.internet.email();
  const testPassword = faker.internet.password();
  const onSubmit = jest.fn();

  const context = await waitFor(async () =>
    render(<LoginForm onSubmit={onSubmit} />),
  );

  fillForm(context, testEmail, testPassword);
  fireEvent.press(context.getByText(/log in/i));
  expect(onSubmit).toHaveBeenCalledWith({
    email: testEmail,
    password: testPassword,
  });
});

it('displays an error when the form is submitted with missing input', async () => {
  const testEmail = faker.internet.email();
  const onSubmit = jest.fn();

  const context = await waitFor(async () =>
    render(<LoginForm onSubmit={onSubmit} />),
  );

  fillForm(context, testEmail, '');
  const {getByText} = context;
  fireEvent.press(getByText(/log in/i));
  expect(onSubmit).not.toHaveBeenCalled();
  getByText(/required/i);
});

it('displays an error when the form is submitted with invalid input', async () => {
  // Generate an invalid email address.
  const testEmail = faker.internet.email().replace('@', '_');
  const testPassword = faker.internet.password();
  const onSubmit = jest.fn();

  const context = await waitFor(async () =>
    render(<LoginForm onSubmit={onSubmit} />),
  );

  fillForm(context, testEmail, testPassword);
  const {getByText} = context;
  fireEvent.press(getByText(/log in/i));
  expect(onSubmit).not.toHaveBeenCalled();
  getByText(/must be a valid email address/i);
});

it('disables user input while in a pending state', async () => {
  const onSubmit = jest.fn();

  const {getByText} = await waitFor(async () =>
    render(<LoginForm onSubmit={onSubmit} isPending />),
  );

  fireEvent.press(getByText(/logging in/i));
  expect(onSubmit).not.toHaveBeenCalled();
});
