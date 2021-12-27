import React from 'react';
import {noop, range} from 'lodash';
import {fakeRecipe} from './factory';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import RecipesList from './RecipesList';

it('displays a list of recipes in order', async () => {
  // Create a list of recipes with titles in alphabetical order.
  const testRecipes = range(3).map(index => {
    return fakeRecipe({
      title: `test-recipe ${String.fromCharCode(index + 65)}`,
    });
  });

  const {getAllByTestId} = await waitFor(async () =>
    render(
      <RecipesList recipes={testRecipes} onPress={noop} onLongPress={noop} />,
    ),
  );

  const listItems = getAllByTestId(/recipe-list-item/i);
  expect(listItems).toHaveLength(3);
  listItems.forEach((listItem, index) => {
    within(listItem).getByText(testRecipes[index].title);
  });
});

it('calls the onPress handler when user presses a list item', async () => {
  const testRecipe = fakeRecipe();
  const testOnPress = jest.fn();

  const {getByText} = await waitFor(async () =>
    render(
      <RecipesList
        recipes={[testRecipe]}
        onPress={testOnPress}
        onLongPress={noop}
      />,
    ),
  );

  fireEvent.press(getByText(testRecipe.title));
  expect(testOnPress).toBeCalledWith(testRecipe);
});

it('calls the onLongPress handler when user long-presses a list item', async () => {
  const testRecipe = fakeRecipe();
  const testOnLongPress = jest.fn();

  const {getByText} = await waitFor(async () =>
    render(
      <RecipesList
        recipes={[testRecipe]}
        onPress={noop}
        onLongPress={testOnLongPress}
      />,
    ),
  );

  fireEvent(getByText(testRecipe.title), 'onLongPress');
  expect(testOnLongPress).toBeCalledWith(testRecipe);
});
