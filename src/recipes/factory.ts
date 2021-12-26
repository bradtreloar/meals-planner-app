import {fakeEntity} from '@app/store/factory';
import {Recipe} from '@app/types';
import faker from 'faker';
import {defaults} from 'lodash';

export const fakeRecipe = (partialRecipe?: Partial<Recipe>): Recipe =>
  defaults(partialRecipe, {
    ...fakeEntity(),
    title: faker.random.words(3),
  });
