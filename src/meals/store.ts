import {createEntitySlice} from '@app/store/entity';
import {EntityState} from '@app/store/types';
import {Meal, MealAttributes} from './types';

const {reducer, actions} = createEntitySlice<MealAttributes>('meals');

export const selectMeals = (state: {meals: EntityState<Meal>}) => state.meals;

export {actions};
export default reducer;
