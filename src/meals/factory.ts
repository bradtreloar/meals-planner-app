import {Recipe} from '@app/recipes/store';
import {fakeEntity} from '@app/store/factory';
import faker from 'faker';
import {defaults} from 'lodash';
import {Meal} from './store';

export const fakeMeal = (recipe: Recipe, partialMeal?: Partial<Meal>): Meal =>
  defaults(partialMeal, {
    ...fakeEntity(),
    date: faker.date.soon().toISOString(),
    recipeID: recipe.id,
  });
