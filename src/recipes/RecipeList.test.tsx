import React from 'react';
import {noop, range} from 'lodash';
import faker from 'faker';
import {fakeRecipe} from './factory';
import {render, waitFor} from '@testing-library/react-native';
import RecipeList from './RecipeList';

it('displays the recipes in alphabetical order', async () => {
  const testRecipes = range(3).map(index => {
    return fakeRecipe({
      title: String.fromCharCode(index + 65) + faker.random.words(3),
    });
  });

  const {getAllByTestId} = await waitFor(async () =>
    render(<RecipeList recipes={testRecipes} onPress={noop} />),
  );

  const listItems = getAllByTestId(/recipe-list-item/i);
  expect(listItems).toHaveLength(3);
  listItems.forEach((listItem, index) => {
    const expectedTitle = testRecipes[index].title;
    expect(listItem.children).toEqual(expectedTitle);
  });
});

it('calls the onSelect handler when user presses a list item', async () => {
  throw new Error('test not implemented');
});

it('calls the onLongPress handler when user presses a list item', async () => {
  throw new Error('test not implemented');
});

it('calls the onDelete handler when user swipes a list item to the side', async () => {
  throw new Error('test not implemented');
});
