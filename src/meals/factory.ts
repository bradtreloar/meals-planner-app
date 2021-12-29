import {Recipe} from '@app/recipes/types';
import {fakeEntity} from '@app/store/factory';
import faker from 'faker';
import {defaults} from 'lodash';
import {Meal} from './types';

export const fakeMeal = (recipe: Recipe, partialMeal?: Partial<Meal>): Meal =>
  defaults(partialMeal, {
    ...fakeEntity(),
    date: faker.date.soon().toISOString(),
    recipeID: recipe.id,
  });
