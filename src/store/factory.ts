import {defaults} from 'lodash';
import faker from 'faker';
import {Entity} from '@app/types';

export const fakeEntity = (partialEntity?: Partial<Entity>): Entity =>
  defaults(
    {
      id: faker.datatype.uuid(),
      created: faker.date.recent().toISOString(),
      changed: faker.date.recent().toISOString(),
    },
    partialEntity,
  );
