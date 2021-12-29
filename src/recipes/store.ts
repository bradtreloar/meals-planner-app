import {RootState} from '@app/store/createStore';
import {createEntitySlice} from '@app/store/entity';
import {RecipeAttributes} from './types';

const {reducer, actions} = createEntitySlice<RecipeAttributes>('recipes');

export const selectRecipes = (state: RootState) => state.recipes;

export {actions};
export default reducer;
