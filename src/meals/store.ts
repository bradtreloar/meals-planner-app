import {RootState} from '@app/store/createStore';
import {createEntitySlice} from '@app/store/entity';
import {MealAttributes} from './types';

const {reducer, actions} = createEntitySlice<MealAttributes>('meals');

export const selectMeals = (state: RootState) => state.meals;

export {actions};
export default reducer;
