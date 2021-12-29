import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import {DateTime} from 'luxon';
import {range} from 'lodash';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {buildEntityState} from '@app/store/entity';
import meals from '@app/meals/store';
import recipes from '@app/recipes/store';
import {Meal} from '@app/meals/types';
import {fakeMeal} from '@app/meals/factory';
import MealsPlannerScreen from '@app/meals/MealsPlannerScreen';
import {fakeRecipe} from '@app/recipes/factory';
import {RecipeSelectScreenProps} from '@app/recipes/RecipeSelectScreen';

const createMockStore = () =>
  configureStore({
    reducer: {
      meals,
      recipes,
    },
  });

function seedStore(recipeCount: number = 1) {
  const store = createMockStore();
  const testRecipes = randomRecipes(recipeCount);
  const testMeals = testRecipes.map((recipe, daysOffset) =>
    fakeMeal(recipe, {
      date: DateTime.utc().plus({days: daysOffset}).toISO(),
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

// interface MealsPlannerScreenFixtureProps {
//   store: ReturnType<typeof createMockStore>;
// }

// const MealsPlannerScreenFixture: React.FC<MealsPlannerScreenFixtureProps> = ({
//   store,
// }) => {
//   const Stack = createNativeStackNavigator();
//   return (
//     <Provider store={store}>
//       <NavigationContainer>
//         <Stack.Navigator>
//           <Stack.Screen
//             name="SelectRecipe"
//             component={MealsPlannerScreen}
//             options={{
//               title: 'Select Recipe',
//             }}
//           />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </Provider>
//   );
// };

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

it('dispatches meals/delete action when user presses a filled slot', () => {
  throw new Error('test not implemented');
});

it('displays meals from current week', () => {
  throw new Error('test not implemented');
});
