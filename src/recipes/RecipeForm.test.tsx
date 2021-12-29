import React from 'react';
import {
  fireEvent,
  render,
  RenderAPI,
  waitFor,
} from '@testing-library/react-native';
import {noop} from 'lodash';
import {fakeRecipe} from './factory';
import RecipeForm from './RecipeForm';
import {Recipe} from './types';

function fillForm(context: RenderAPI, recipe: Recipe) {
  const {getByLabelText} = context;
  fireEvent.changeText(getByLabelText(/recipe name/i), recipe.title);
}

describe('new recipe form', () => {
  const testRecipe = fakeRecipe();

  it('accepts user input', async () => {
    const {getByLabelText} = await waitFor(async () =>
      render(<RecipeForm onSubmit={noop} onCancel={noop} />),
    );

    const titleInput = getByLabelText(/recipe name/i);
    fireEvent.changeText(titleInput, testRecipe.title);
    expect(titleInput.props.value).toEqual(testRecipe.title);
  });

  it('calls the onSubmit handler when the save button is pressed.', async () => {
    const mockOnSubmitHandler = jest.fn();

    const context = await waitFor(async () =>
      render(<RecipeForm onSubmit={mockOnSubmitHandler} onCancel={noop} />),
    );

    fillForm(context, testRecipe);
    fireEvent(context.getByLabelText(/save/i), 'onPress');
    expect(mockOnSubmitHandler).toHaveBeenCalledWith({
      title: testRecipe.title,
    });
  });

  it('calls the onCancel handler when the cancel button is pressed.', async () => {
    const mockOnCancelHandler = jest.fn();

    const {getByLabelText} = await waitFor(async () =>
      render(<RecipeForm onSubmit={noop} onCancel={mockOnCancelHandler} />),
    );

    fireEvent(getByLabelText(/cancel/i), 'onPress');
    expect(mockOnCancelHandler).toHaveBeenCalled();
  });

  it('displays an error when the form is submitted with missing input', async () => {
    const mockOnSubmitHandler = jest.fn();

    const context = await waitFor(async () =>
      render(<RecipeForm onSubmit={mockOnSubmitHandler} onCancel={noop} />),
    );

    const {getByText} = context;
    fireEvent.press(getByText(/save/i));
    expect(mockOnSubmitHandler).not.toHaveBeenCalled();
    getByText(/required/i);
  });
});

describe('edit recipe form', () => {
  const testRecipe = fakeRecipe();

  it('disables user input while in a pending state', async () => {
    const mockOnSubmitHandler = jest.fn();

    const {getByText} = await waitFor(async () =>
      render(
        <RecipeForm
          onSubmit={mockOnSubmitHandler}
          onCancel={noop}
          isPending
          defaultValues={{title: testRecipe.title}}
        />,
      ),
    );

    fireEvent.press(getByText(/save/i));
    expect(mockOnSubmitHandler).not.toHaveBeenCalled();
  });

  it('calls the onDelete handler when the delete button is pressed.', async () => {
    const mockOnDeleteHandler = jest.fn();

    const {getByLabelText} = await waitFor(async () =>
      render(
        <RecipeForm
          onSubmit={noop}
          onCancel={noop}
          onDelete={mockOnDeleteHandler}
        />,
      ),
    );

    fireEvent(getByLabelText(/delete/i), 'onPress');
    expect(mockOnDeleteHandler).toHaveBeenCalled();
  });
});
