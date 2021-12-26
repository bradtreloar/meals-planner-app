import {configureStore} from '@reduxjs/toolkit';
import {useDispatch} from 'react-redux';
import recipes from '@app/recipes/store';

export type StoreStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export const entityReducers = {
  recipes,
  // meals,
};

const createStore = () =>
  configureStore({
    reducer: {
      ...entityReducers,
    },
  });

// Typed useDispatch hook to prevent type errors.
export const useThunkDispatch = () => useDispatch<AppStore['dispatch']>();

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore['getState']>;
export default createStore;
