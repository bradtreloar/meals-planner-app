import {createEntitySlice} from '@app/store/entity';
import {EntityState} from '@app/store/types';
import {Recipe, RecipeAttributes} from './types';

const {reducer, actions} = createEntitySlice<RecipeAttributes>('recipes');

export const selectRecipes = (state: {recipes: EntityState<Recipe>}) =>
  state.recipes;

export {actions};
export default reducer;
