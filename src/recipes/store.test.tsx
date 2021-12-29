import {configureStore} from '@reduxjs/toolkit';
import recipes, {actions as recipeActions} from './store';
import {Recipe} from './types';
import * as firebaseDatabase from '@app/firebase/database';
import {fakeRecipe} from './factory';
import {range} from 'lodash';
import {buildEntityState} from '@app/store/entity';
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {useThunkDispatch} from '@app/store/createStore';
import {render, waitFor} from '@testing-library/react-native';
jest.mock('@app/firebase/database');

const createMockStore = () =>
  configureStore({
    reducer: {
      recipes,
    },
  });

const randomRecipes = (entityCount: number) =>
  range(entityCount).map(() => fakeRecipe());

function seedStore(recipeCount: number = 1) {
  const store = createMockStore();
  store.dispatch({
    type: 'recipes/set',
    payload: buildEntityState(randomRecipes(recipeCount)),
  });
  return store;
}

test('add recipe', async () => {
  const store = seedStore(0);
  const testRecipe = fakeRecipe();
  jest.spyOn(firebaseDatabase, 'addEntity').mockResolvedValue(testRecipe);
  const action = await store.dispatch(
    recipeActions.add({
      title: testRecipe.title,
      isSoftDeleted: testRecipe.isSoftDeleted,
    }),
  );
  expect(firebaseDatabase.addEntity).toHaveBeenCalledWith('recipes', {
    title: testRecipe.title,
    isSoftDeleted: testRecipe.isSoftDeleted,
  });
  expect(action.type).toBe(`recipes/add/fulfilled`);
  expect(action.payload).toBe(testRecipe);
  expect(store.getState().recipes.entities.allIDs).toContain(testRecipe.id);
});

test('add recipe using useDispatch hook', async () => {
  const store = seedStore(0);
  const testRecipe = fakeRecipe();
  jest.spyOn(firebaseDatabase, 'addEntity').mockResolvedValue(testRecipe);

  const DispatchFixture: React.FC<{
    recipe: Recipe;
  }> = ({recipe}) => {
    const dispatch = useThunkDispatch();
    useEffect(() => {
      (async () => {
        await dispatch(
          recipeActions.add({
            title: recipe.title,
            isSoftDeleted: recipe.isSoftDeleted,
          }),
        );
      })();
    }, [dispatch, recipe]);
    return null;
  };

  await waitFor(async () =>
    render(
      <Provider store={store}>
        <DispatchFixture recipe={testRecipe} />
      </Provider>,
    ),
  );

  expect(firebaseDatabase.addEntity).toHaveBeenCalledWith('recipes', {
    title: testRecipe.title,
    isSoftDeleted: testRecipe.isSoftDeleted,
  });
  expect(store.getState().recipes.entities.allIDs).toContain(testRecipe.id);
});
