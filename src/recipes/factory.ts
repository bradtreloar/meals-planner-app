import {fakeEntity} from 'src/store/factory';
import {Recipe} from 'src/recipes/types';
import faker from 'faker';
import {defaults} from 'lodash';

export const fakeRecipe = (partialRecipe?: Partial<Recipe>): Recipe =>
  defaults(partialRecipe, {
    ...fakeEntity(),
    title: faker.random.words(3),
    isSoftDeleted: false,
  });
