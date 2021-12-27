import {configureStore} from '@reduxjs/toolkit';
import {useDispatch} from 'react-redux';
import recipes from '@app/recipes/store';
import meals from '@app/meals/store';

const entityReducers = {
  recipes,
  meals,
};

const createStore = () =>
  configureStore({
    reducer: {
      ...entityReducers,
    },
  });

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore['getState']>;
export default createStore;

// Typed useDispatch hook to prevent type errors.
export const useThunkDispatch = () => useDispatch<AppStore['dispatch']>();
