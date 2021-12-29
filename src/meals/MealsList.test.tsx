import React from 'react';
import {noop, range} from 'lodash';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import {fakeRecipe} from '@app/recipes/factory';
import {fakeMeal} from '@app/meals/factory';
import MealsList, {MealItem} from './MealsList';
import {DateTime} from 'luxon';

it('displays a list of meals in date order', async () => {
  const itemCount = 7;
  const testRecipes = range(itemCount).map(() => fakeRecipe());
  const testMeals = testRecipes.map((recipe, daysOffset) =>
    fakeMeal(recipe, {
      date: DateTime.local().plus({days: daysOffset}).toISO(),
    }),
  );
  const testMealItems: MealItem[] = testMeals.map((meal, index) => ({
    date: DateTime.fromISO(meal.date),
    mealID: meal.id,
    recipeTitle: testRecipes[index].title,
  }));

  const {getAllByTestId} = await waitFor(async () =>
    render(<MealsList mealItems={testMealItems} onPress={noop} />),
  );

  const listItems = getAllByTestId(/meal-list-item/i);
  expect(listItems).toHaveLength(itemCount);
  listItems.forEach((listItem, index) => {
    within(listItem).getByText(testRecipes[index].title);
  });
});

it('calls the onPress handler when user presses a list item', async () => {
  const testRecipe = fakeRecipe();
  const testMeal = fakeMeal(testRecipe);
  const testMealItems = [
    {
      date: DateTime.fromISO(testMeal.date),
      mealID: testMeal.id,
      recipeTitle: testRecipe.title,
    },
    {
      date: DateTime.fromISO(testMeal.date).plus({days: 1}),
    },
  ];
  const testOnPress = jest.fn();

  const {getByText} = await waitFor(async () =>
    render(<MealsList mealItems={testMealItems} onPress={testOnPress} />),
  );
  fireEvent.press(getByText(testRecipe.title));
  expect(testOnPress).toHaveBeenCalledWith(testMealItems[0]);
  fireEvent.press(getByText(/add meal/i));
  expect(testOnPress).toHaveBeenCalledWith(testMealItems[1]);
});
