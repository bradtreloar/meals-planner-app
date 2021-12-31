import {configureStore} from '@reduxjs/toolkit';
import meals, {actions as recipeActions} from './store';
import {Meal} from './types';
import * as firebaseDatabase from 'src/firebase/database';
import {fakeMeal} from './factory';
import {range} from 'lodash';
import {buildEntityState} from 'src/store/entity';
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {useThunkDispatch} from 'src/store/createStore';
import {render, waitFor} from '@testing-library/react-native';
import {fakeRecipe} from 'src/recipes/factory';
jest.mock('src/firebase/database');

const createMockStore = () =>
  configureStore({
    reducer: {
      meals,
    },
  });

const randomMeals = (entityCount: number) =>
  range(entityCount).map(() => fakeMeal(fakeRecipe()));

function seedStore(recipeCount: number = 1) {
  const store = createMockStore();
  store.dispatch({
    type: 'meals/set',
    payload: buildEntityState(randomMeals(recipeCount)),
  });
  return store;
}

test('add meal', async () => {
  const store = seedStore(0);
  const testMeal = fakeMeal(fakeRecipe());
  jest.spyOn(firebaseDatabase, 'addEntity').mockResolvedValue(testMeal);
  const action = await store.dispatch(
    recipeActions.add({
      date: testMeal.date,
      recipeID: testMeal.recipeID,
    }),
  );
  expect(firebaseDatabase.addEntity).toHaveBeenCalledWith('meals', {
    date: testMeal.date,
    recipeID: testMeal.recipeID,
  });
  expect(action.type).toBe(`meals/add/fulfilled`);
  expect(action.payload).toBe(testMeal);
  expect(store.getState().meals.entities.allIDs).toContain(testMeal.id);
});

test('add meal using useDispatch hook', async () => {
  const store = seedStore(0);
  const testMeal = fakeMeal(fakeRecipe());
  jest.spyOn(firebaseDatabase, 'addEntity').mockResolvedValue(testMeal);

  const DispatchFixture: React.FC<{
    recipe: Meal;
  }> = ({recipe}) => {
    const dispatch = useThunkDispatch();
    useEffect(() => {
      (async () => {
        await dispatch(
          recipeActions.add({
            date: testMeal.date,
            recipeID: testMeal.recipeID,
          }),
        );
      })();
    }, [dispatch, recipe]);
    return null;
  };

  await waitFor(async () =>
    render(
      <Provider store={store}>
        <DispatchFixture recipe={testMeal} />
      </Provider>,
    ),
  );

  expect(firebaseDatabase.addEntity).toHaveBeenCalledWith('meals', {
    date: testMeal.date,
    recipeID: testMeal.recipeID,
  });
  expect(store.getState().meals.entities.allIDs).toContain(testMeal.id);
});
