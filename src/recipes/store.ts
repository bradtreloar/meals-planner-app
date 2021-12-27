import {RootState} from '@app/store/createStore';
import {createEntitySlice, EntityType} from '@app/store/entity';

export interface RecipeAttributes {
  title: string;
}

export type Recipe = EntityType<RecipeAttributes>;

const {reducer, actions} = createEntitySlice<RecipeAttributes>('recipes');

export const selectRecipes = (state: RootState) => state.recipes;

export {actions};
export default reducer;
