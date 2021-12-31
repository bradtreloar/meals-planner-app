import React from 'react';
import {orderBy, pick, range, values} from 'lodash';
import faker from 'faker';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import {
  fireEvent,
  render,
  RenderAPI,
  waitFor,
  within,
} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {DateTime, Settings as LuxonSettings} from 'luxon';
import RecipeSelectScreen from './RecipeSelectScreen';
import {fakeRecipe} from './factory';
import {buildEntityState} from 'src/store/entity';
import recipes from './store';
import {Recipe} from './types';
import meals, {actions as mealActions} from 'src/meals/store';
import {Meal} from 'src/meals/types';
import {fakeMeal} from 'src/meals/factory';
import {act} from 'react-test-renderer';
import {Button, View} from 'react-native';
import {MealsPlannerScreenProps} from 'src/meals/MealsPlannerScreen';
import * as firebaseDatabase from 'src/firebase/database';
jest.mock('src/firebase/database');

const createMockStore = () =>
  configureStore({
    reducer: {
      recipes,
      meals,
    },
  });

const randomRecipes = (entityCount: number) =>
  range(entityCount).map(() => fakeRecipe());

function seedStore(recipeCount: number = 1) {
  const store = createMockStore();
  store.dispatch({
    type: `recipes/set`,
    payload: buildEntityState(randomRecipes(recipeCount)),
  });
  return store;
}

beforeEach(() => {
  LuxonSettings.defaultZone = 'utc';
  // Mock the current time to midnight on Monday 3 January 2000.
  const mockNow = DateTime.utc(2000, 1, 3, 0, 0, 0, 0);
  LuxonSettings.now = () => mockNow.toMillis();
});

it('renders a list of recipes in alphabetical order', async () => {
  const store = createMockStore();
  const testRecipes = [
    fakeRecipe({title: 'recipe-item BBB'}),
    fakeRecipe({title: 'recipe-item AAA'}),
    fakeRecipe({title: 'recipe-item CCC'}),
  ];
  store.dispatch({
    type: `recipes/set`,
    payload: buildEntityState(testRecipes),
  });

  const Stack = createNativeStackNavigator();
  const {getAllByTestId} = await waitFor(async () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="SelectRecipe"
              component={RecipeSelectScreen}
              options={{
                title: 'Select Recipe',
              }}
              initialParams={{
                mealDate: DateTime.utc().startOf('day'),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    ),
  );

  const sortedFakeRecipes = orderBy(
    testRecipes,
    ['title'],
    ['asc'],
  ) as Recipe[];
  const recipesListItems = getAllByTestId(/recipe-list-item/i);
  recipesListItems.forEach((recipesListItem, index) => {
    const recipe = sortedFakeRecipes[index];
    within(recipesListItem).getByText(recipe.title);
  });
});

it('does not display soft deleted recipes', async () => {
  const store = createMockStore();
  const testRecipes = [
    fakeRecipe({title: 'visible-recipe'}),
    fakeRecipe({title: 'soft-deleted-recipe', isSoftDeleted: true}),
  ];
  store.dispatch({
    type: `recipes/set`,
    payload: buildEntityState(testRecipes),
  });

  const Stack = createNativeStackNavigator();
  const {getAllByTestId} = await waitFor(async () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="SelectRecipe"
              component={RecipeSelectScreen}
              options={{
                title: 'Select Recipe',
              }}
              initialParams={{
                mealDate: DateTime.utc().startOf('day'),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    ),
  );

  const recipesListItems = getAllByTestId(/recipe-list-item/i);
  expect(recipesListItems).toHaveLength(1);
  recipesListItems.forEach(recipesListItem => {
    within(recipesListItem).getByText('visible-recipe');
  });
});

function fillForm(context: RenderAPI, recipe: Recipe) {
  const {getByLabelText} = context;
  fireEvent.changeText(getByLabelText(/recipe name/i), recipe.title);
}

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

interface RecipeSelectScreenFixtureProps {
  store: ReturnType<typeof createMockStore>;
  mealDate: DateTime;
}

const RecipeSelectScreenFixture: React.FC<RecipeSelectScreenFixtureProps> = ({
  store,
  mealDate,
}) => {
  const Stack = createNativeStackNavigator();
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="SelectRecipe"
            component={RecipeSelectScreen}
            options={{
              title: 'Select Recipe',
            }}
            initialParams={{
              mealDate,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

it('dispatches meals/add action when user presses item in recipe list', async () => {
  const store = seedStore(1);
  const testRecipe: Recipe = values(store.getState().recipes.entities.byID)[0];
  const testMealDate = DateTime.utc().startOf('day');

  const {getByText} = await waitFor(async () =>
    render(<RecipeSelectScreenFixture store={store} mealDate={testMealDate} />),
  );

  jest.spyOn(mealActions, 'add');
  fireEvent(getByText(testRecipe.title), 'onPress');
  expect(mealActions.add).toHaveBeenCalledWith({
    date: testMealDate.toISO(),
    recipeID: testRecipe.id,
  });
});

it('navigates back to the meals planner when user presses item in recipe list', async () => {
  const store = seedStore(1);
  const testRecipe: Recipe = values(store.getState().recipes.entities.byID)[0];
  const testMealDate = DateTime.utc().startOf('day');
  const testMeal: Meal = fakeMeal(testRecipe, {
    date: testMealDate.toISO(),
  });

  const MockMealsPlannerScreen: React.FC<MealsPlannerScreenProps> = ({
    navigation,
  }) => {
    return (
      <View testID="mock-meals-planner-screen">
        <Button
          title="Add Meal"
          onPress={() => {
            navigation.navigate('SelectRecipe', {
              mealDate: testMealDate,
            });
          }}
        />
      </View>
    );
  };

  const Stack = createNativeStackNavigator();
  const {getByText, getByTestId} = await waitFor(async () =>
    render(
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="MealsPlanner">
            <Stack.Screen
              name="MealsPlanner"
              component={MockMealsPlannerScreen}
              options={{
                title: 'Meals Planner',
              }}
            />
            <Stack.Screen
              name="SelectRecipe"
              component={RecipeSelectScreen}
              options={{
                title: 'Select Recipe',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>,
    ),
  );

  jest.spyOn(firebaseDatabase, 'addEntity').mockResolvedValue(testMeal);
  await act(async () => {
    fireEvent(getByText(/add meal/i), 'onPress');
  });
  await act(async () => {
    fireEvent(getByText(testRecipe.title), 'onPress');
  });
  getByTestId(/mock-meals-planner-screen/i);
});

describe('recipe edit modal', () => {
  it('appears when user long-presses item in recipe list', async () => {
    const store = seedStore(1);
    const testRecipe: Recipe = values(
      store.getState().recipes.entities.byID,
    )[0];
    const testMealDate = DateTime.utc().startOf('day');

    const {getByText, getByTestId} = await waitFor(async () =>
      render(
        <RecipeSelectScreenFixture store={store} mealDate={testMealDate} />,
      ),
    );

    expect(getByTestId('recipe-modal')).toHaveProp('visible', false);
    await act(async () => {
      fireEvent(getByText(testRecipe.title), 'onLongPress');
    });
    expect(getByTestId('recipe-modal')).toHaveProp('visible', true);
  });

  it('dispatches recipes/update action when user presses save button', async () => {
    const store = seedStore(1);
    const testRecipe: Recipe = values(
      store.getState().recipes.entities.byID,
    )[0];
    const testMealDate = DateTime.utc().startOf('day');

    const context = await waitFor(async () =>
      render(
        <RecipeSelectScreenFixture store={store} mealDate={testMealDate} />,
      ),
    );

    const {getByText, getByTestId, getByA11yLabel} = context;
    expect(getByTestId('recipe-modal')).toHaveProp('visible', false);
    await act(async () => {
      fireEvent(getByText(testRecipe.title), 'onLongPress');
    });
    expect(getByTestId('recipe-modal')).toHaveProp('visible', true);
    testRecipe.title = faker.random.words(3);
    testRecipe.updated = DateTime.utc().toISO();
    jest.spyOn(firebaseDatabase, 'updateEntity').mockResolvedValue(testRecipe);
    fillForm(context, testRecipe);
    await act(async () => {
      fireEvent(getByA11yLabel(/save/i), 'onPress');
    });
    expect(firebaseDatabase.updateEntity).toHaveBeenCalledWith(
      'recipes',
      testRecipe,
    );
    expect(store.getState().recipes.entities.byID[testRecipe.id]).toStrictEqual(
      testRecipe,
    );
  });

  it('dispatches recipes/update action when user presses delete button', async () => {
    const store = seedStore(1);
    const testRecipe: Recipe = values(
      store.getState().recipes.entities.byID,
    )[0];
    const testMealDate = DateTime.utc().startOf('day');

    const context = await waitFor(async () =>
      render(
        <RecipeSelectScreenFixture store={store} mealDate={testMealDate} />,
      ),
    );

    const {getByText, getByTestId, getByA11yLabel} = context;
    expect(getByTestId('recipe-modal')).toHaveProp('visible', false);
    await act(async () => {
      fireEvent(getByText(testRecipe.title), 'onLongPress');
    });
    expect(getByTestId('recipe-modal')).toHaveProp('visible', true);
    testRecipe.isSoftDeleted = true;
    testRecipe.updated = DateTime.utc().toISO();
    jest.spyOn(firebaseDatabase, 'updateEntity').mockResolvedValue(testRecipe);
    await act(async () => {
      fireEvent(getByA11yLabel(/delete/i), 'onPress');
    });
    expect(firebaseDatabase.updateEntity).toHaveBeenCalledWith(
      'recipes',
      testRecipe,
    );
    expect(store.getState().recipes.entities.byID[testRecipe.id]).toStrictEqual(
      testRecipe,
    );
  });

  // it('closes when user presses save button', async () => {
  //   jest.useFakeTimers();
  //   const store = seedStore(1);
  //   const testRecipe: Recipe = values(
  //     store.getState().recipes.entities.byID,
  //   )[0];
  //   const testMealDate = DateTime.utc().startOf('day');

  //   const context = await waitFor(async () =>
  //     render(
  //       <RecipeSelectScreenFixture store={store} mealDate={testMealDate} />,
  //     ),
  //   );

  //   const {getByText, getByTestId, getByA11yLabel} = context;
  //   expect(getByTestId('recipe-modal')).toHaveProp('visible', false);
  //   await act(async () => {
  //     fireEvent(getByText(testRecipe.title), 'onLongPress');
  //   });
  //   expect(getByTestId('recipe-modal')).toHaveProp('visible', true);
  //   jest.spyOn(firebaseDatabase, 'updateEntity').mockResolvedValue(testRecipe);
  //   await act(async () => {
  //     fireEvent(getByA11yLabel(/save/i), 'onPress');
  //   });
  //   expect(getByTestId('recipe-modal')).toHaveProp('visible', false);
  // });
});

describe('recipe add modal', () => {
  it('appears when user presses add recipe button', async () => {
    const store = seedStore(0);
    const testMealDate = DateTime.utc().startOf('day');

    const {getByTestId, getByA11yLabel} = await waitFor(async () =>
      render(
        <RecipeSelectScreenFixture store={store} mealDate={testMealDate} />,
      ),
    );

    expect(getByTestId('recipe-modal')).toHaveProp('visible', false);
    await act(async () => {
      fireEvent(getByA11yLabel(/add recipe/i), 'onPress');
    });
    expect(getByTestId('recipe-modal')).toHaveProp('visible', true);
  });

  it('dispatches recipes/add action when user presses save button', async () => {
    const store = seedStore(0);
    const testRecipe = fakeRecipe();
    const testMealDate = DateTime.utc().startOf('day');

    const context = await waitFor(async () =>
      render(
        <RecipeSelectScreenFixture store={store} mealDate={testMealDate} />,
      ),
    );

    const {getByTestId, getByA11yLabel} = context;
    expect(getByTestId('recipe-modal')).toHaveProp('visible', false);
    await act(async () => {
      fireEvent(getByA11yLabel(/add recipe/i), 'onPress');
    });
    expect(getByTestId('recipe-modal')).toHaveProp('visible', true);
    jest.spyOn(firebaseDatabase, 'addEntity').mockResolvedValue(testRecipe);
    fillForm(context, testRecipe);
    await act(async () => {
      fireEvent(getByA11yLabel(/save/i), 'onPress');
    });
    expect(firebaseDatabase.addEntity).toHaveBeenCalledWith(
      'recipes',
      pick(testRecipe, ['title', 'isSoftDeleted']),
    );
    expect(store.getState().recipes.entities.byID[testRecipe.id]).toStrictEqual(
      testRecipe,
    );
  });
});
