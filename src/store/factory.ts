import {defaults} from 'lodash';
import faker from 'faker';
import {Entity} from './types';

export const fakeEntity = (partialEntity?: Partial<Entity>): Entity =>
  defaults(partialEntity, {
    id: faker.datatype.uuid(),
    created: faker.date.recent().toISOString(),
    updated: faker.date.recent().toISOString(),
  });
