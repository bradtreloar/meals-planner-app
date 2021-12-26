import {createEntitySlice, EntityType} from '@app/store/entity';

export interface RecipeAttributes {
  title: string;
}

export type Recipe = EntityType<RecipeAttributes>;

const {reducer, actions} = createEntitySlice<RecipeAttributes>('recipes');

export {actions};
export default reducer;
