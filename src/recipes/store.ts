import {createEntitySlice} from 'src/store/entity';
import {EntityState} from 'src/store/types';
import {Recipe, RecipeAttributes} from './types';

const {reducer, actions} = createEntitySlice<RecipeAttributes>('recipes');

export const selectRecipes = (state: {recipes: EntityState<Recipe>}) =>
  state.recipes;

export {actions};
export default reducer;
