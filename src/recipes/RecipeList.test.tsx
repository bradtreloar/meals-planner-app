import React from 'react';
import {noop, range} from 'lodash';
// import faker from 'faker';
import {fakeRecipe} from './factory';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import RecipeList from './RecipeList';

it('displays the recipes in alphabetical order', async () => {
  // Create a list of recipes with titles in alphabetical order.
  const testRecipes = range(3).map(index => {
    return fakeRecipe({
      title: `test-recipe ${String.fromCharCode(index + 65)}`,
    });
  });

  // Pass the recipes to the RecipeList in reverse order.
  const {getAllByText} = await waitFor(async () =>
    render(
      <RecipeList
        recipes={Array.from(testRecipes).reverse()}
        onPress={noop}
        onLongPress={noop}
      />,
    ),
  );

  const listItems = getAllByText(/test-recipe/i);
  expect(listItems).toHaveLength(3);
  listItems.forEach((listItem, index) => {
    within(listItem).getByText(testRecipes[index].title);
  });
});

it('calls the onPress handler when user presses a list item', async () => {
  const testRecipe = fakeRecipe();
  const testOnPress = jest.fn();

  // Pass the recipes to the RecipeList in reverse order.
  const {getByText} = await waitFor(async () =>
    render(
      <RecipeList
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

  // Pass the recipes to the RecipeList in reverse order.
  const {getByText} = await waitFor(async () =>
    render(
      <RecipeList
        recipes={[testRecipe]}
        onPress={noop}
        onLongPress={testOnLongPress}
      />,
    ),
  );

  fireEvent(getByText(testRecipe.title), 'onLongPress');
  expect(testOnLongPress).toBeCalledWith(testRecipe);
});
