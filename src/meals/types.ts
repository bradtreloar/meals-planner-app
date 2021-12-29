import {EntityType} from '@app/store/types';

export interface MealAttributes {
  date: string;
  recipeID: string;
}

export type Meal = EntityType<MealAttributes>;
