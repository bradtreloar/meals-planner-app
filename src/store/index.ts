import {Recipe} from '@app/types';
import {configureStore} from '@reduxjs/toolkit';
import {firebaseReducer} from 'react-redux-firebase';

export interface Schema {
  recipes: Recipe;
}

const store = configureStore({
  reducer: {
    firebase: firebaseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
