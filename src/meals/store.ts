import {RootState} from '@app/store/createStore';
import {createEntitySlice, EntityType} from '@app/store/entity';

export interface MealAttributes {
  date: string;
  recipeID: string;
}

export type Meal = EntityType<MealAttributes>;

const {reducer, actions} = createEntitySlice<MealAttributes>('meals');

export const selectMeals = (state: RootState) => state.meals;

export {actions};
export default reducer;
