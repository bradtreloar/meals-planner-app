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
import {DateTime} from 'luxon';
import RecipeSelectScreen from './RecipeSelectScreen';
import {fakeRecipe} from './factory';
import {buildEntityState} from '@app/store/entity';
import recipes, {Recipe} from './store';
import meals, {actions as mealActions, Meal} from '@app/meals/store';
import {fakeMeal} from '@app/meals/factory';
import {act} from 'react-test-renderer';
import {Button, View} from 'react-native';
import {MealsPlannerScreenProps} from '@app/meals/MealsPlannerScreen';
import * as firebaseDatabase from '@app/firebase/database';
jest.mock('@app/firebase/database');

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
                mealDate: DateTime.local(),
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
                mealDate: DateTime.local(),
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
  const testMealDate = DateTime.local();

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
  const testMealDate = DateTime.local();
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
    const testMealDate = DateTime.local();

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
    const testMealDate = DateTime.local();

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
    testRecipe.updated = DateTime.local().toISO();
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
    const testMealDate = DateTime.local();

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
    testRecipe.updated = DateTime.local().toISO();
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
  //   const testMealDate = DateTime.local();

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
    const testMealDate = DateTime.local();

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
    const testMealDate = DateTime.local();

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
