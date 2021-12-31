import React from 'react';
import {noop, range} from 'lodash';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import {fakeRecipe} from 'src/recipes/factory';
import {fakeMeal} from 'src/meals/factory';
import MealsList, {MealSlot} from './MealSlotList';
import {DateTime, Settings as LuxonSettings} from 'luxon';

beforeEach(() => {
  LuxonSettings.defaultZone = 'utc';
  // Mock the current time to midnight on Monday 3 January 2000.
  const mockNow = DateTime.utc(2000, 1, 3, 0, 0, 0, 0);
  LuxonSettings.now = () => mockNow.toMillis();
});

it('displays a list of meals in date order', async () => {
  const itemCount = 7;
  const testRecipes = range(itemCount).map(() => fakeRecipe());
  const testMeals = testRecipes.map((recipe, daysOffset) =>
    fakeMeal(recipe, {
      date: DateTime.utc().startOf('day').plus({days: daysOffset}).toISO(),
    }),
  );
  const testMealSlots: MealSlot[] = testMeals.map((meal, index) => ({
    date: DateTime.fromISO(meal.date),
    mealID: meal.id,
    recipeTitle: testRecipes[index].title,
  }));

  const {getAllByTestId} = await waitFor(async () =>
    render(<MealsList mealSlots={testMealSlots} onPress={noop} />),
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
  const testMealSlots = [
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
    render(<MealsList mealSlots={testMealSlots} onPress={testOnPress} />),
  );
  fireEvent.press(getByText(testRecipe.title));
  expect(testOnPress).toHaveBeenCalledWith(testMealSlots[0]);
  fireEvent.press(getByText(/add meal/i));
  expect(testOnPress).toHaveBeenCalledWith(testMealSlots[1]);
});
