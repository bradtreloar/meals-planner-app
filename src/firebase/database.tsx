import database from '@react-native-firebase/database';
import {EntityType} from 'src/store/types';
import {DateTime} from 'luxon';

export async function addEntity<A>(entityType: string, attributes: A) {
  const ref = database().ref(`/${entityType}`).push();
  await ref.set(attributes);
  return {
    id: ref.key as string,
    created: DateTime.utc().toISO(),
    updated: DateTime.utc().toISO(),
    ...attributes,
  } as EntityType<A>;
}

export async function updateEntity<A>(
  entityType: string,
  entity: EntityType<A>,
) {
  await database().ref(`/${entityType}/${entity.id}`).update(entity);
  return {
    ...entity,
    updated: DateTime.utc().toISO(),
  } as EntityType<A>;
}

export async function deleteEntity<A>(
  entityType: string,
  entity: EntityType<A>,
) {
  await database().ref(`/${entityType}/${entity.id}`).remove();
  return entity;
}
