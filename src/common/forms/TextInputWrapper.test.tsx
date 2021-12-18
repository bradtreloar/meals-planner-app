import {fireEvent, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import TextInputWrapper from './TextInputWrapper';

it('calls onChange handler when user types into the text input', async () => {
  const onChange = jest.fn();
  const {getByLabelText} = await waitFor(async () =>
    render(
      <TextInputWrapper
        label="Test"
        name="test"
        value=""
        onChangeText={onChange}
      />,
    ),
  );
  const textInput = getByLabelText(/test/i);
  fireEvent.changeText(textInput, 'a');
  expect(onChange).toBeCalledWith('test', 'a');
});
