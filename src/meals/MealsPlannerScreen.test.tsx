import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import {DateTime, Settings as LuxonSettings} from 'luxon';
import {range, values} from 'lodash';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {buildEntityState} from 'src/store/entity';
import meals, {actions as mealActions} from 'src/meals/store';
import recipes from 'src/recipes/store';
import {Meal} from 'src/meals/types';
import {fakeMeal} from 'src/meals/factory';
import MealsPlannerScreen from 'src/meals/MealsPlannerScreen';
import {fakeRecipe} from 'src/recipes/factory';
import {RecipeSelectScreenProps} from 'src/recipes/RecipeSelectScreen';
import {act} from 'react-test-renderer';

const createMockStore = () =>
  configureStore({
    reducer: {
      meals,
      recipes,
    },
  });

function seedStore(recipeCount: number = 0) {
  const store = createMockStore();
  const testRecipes = randomRecipes(recipeCount);
  const testMeals = testRecipes.map((recipe, daysOffset) =>
    fakeMeal(recipe, {
      date: DateTime.utc().startOf('day').plus({days: daysOffset}).toISO(),
    }),
  ) as Meal[];
  store.dispatch({
    type: `meals/set`,
    payload: buildEntityState(testMeals),
  });
  store.dispatch({
    type: `recipes/set`,
    payload: buildEntityState(testRecipes),
  });
  return store;
}

const randomRecipes = (entityCount: number) =>
  range(entityCount).map(() => fakeRecipe());

interface MealsPlannerScreenFixtureProps {
  store: ReturnType<typeof createMockStore>;
}

beforeEach(() => {
  LuxonSettings.defaultZone = 'utc';
  // Mock the current time to midnight on Monday 3 January 2000.
  const mockNow = DateTime.utc(2000, 1, 3, 0, 0, 0, 0);
  LuxonSettings.now = () => mockNow.toMillis();
});

const MealsPlannerScreenFixture: React.FC<MealsPlannerScreenFixtureProps> = ({
  store,
}) => {
  const Stack = createNativeStackNavigator();
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="SelectRecipe"
            component={MealsPlannerScreen}
            options={{
              title: 'Select Recipe',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

it('opens the recipe select screen when user presses an empty slot', async () => {
  const store = seedStore(0);
  const MockRecipeSelectScreen: React.FC<RecipeSelectScreenProps> = ({
    route,
  }) => {
    const date = route.params.mealDate;
    return (
      <View testID="mock-recipe-select-screen">
        <Text>{date.toISO()}</Text>
      </View>
    );
  };
  const Stack = createNativeStackNavigator();
  const {getAllByText, getByTestId} = await waitFor(async () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="MealsPlanner"
              component={MealsPlannerScreen}
              options={{
                title: 'Meals Planner',
              }}
            />
            <Stack.Screen
              name="SelectRecipe"
              component={MockRecipeSelectScreen}
              options={{
                title: 'Select Recipe',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    ),
  );
  fireEvent(getAllByText(/add meal/i)[0], 'onPress');
  getByTestId(/mock-recipe-select-screen/i);
});

it('dispatches meals/delete action when user presses a filled slot', async () => {
  const store = seedStore(1);
  const testRecipe = values(store.getState().recipes.entities.byID)[0];
  const testMeal = values(store.getState().meals.entities.byID)[0];
  const {getByText} = await waitFor(async () =>
    render(<MealsPlannerScreenFixture store={store} />),
  );
  const mockMealDeleteAction = jest.spyOn(mealActions, 'delete');
  await act(async () => {
    fireEvent(getByText(testRecipe.title), 'onPress');
  });
  expect(mockMealDeleteAction).toHaveBeenCalledWith(testMeal);
});

it('displays meals from current week by default', async () => {
  const store = seedStore(0);
  const now = DateTime.local();
  const testRecipes = randomRecipes(2);
  const testMeals = [
    fakeMeal(testRecipes[0], {
      id: 'previous_week_meal',
      date: now.minus({days: 1}).toISO(),
    }),
    fakeMeal(testRecipes[1], {
      id: 'current_week_meal',
      date: now.plus({days: 1}).toISO(),
    }),
  ];
  store.dispatch({
    type: `meals/set`,
    payload: buildEntityState(testMeals),
  });
  store.dispatch({
    type: `recipes/set`,
    payload: buildEntityState(testRecipes),
  });
  const {getByText, queryByText} = await waitFor(async () =>
    render(<MealsPlannerScreenFixture store={store} />),
  );
  getByText(testRecipes[1].title);
  expect(queryByText(testRecipes[0].title)).toBeNull();
});
