export type StoreStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface Timestamps {
  created: string;
  updated: string;
}

export interface Entity extends Timestamps {
  id: string;
}

export type EntityType<Attributes> = Entity & Attributes;

export interface EntitiesByID<T> {
  [key: string]: T;
}

export interface EntityStateData<T> {
  byID: EntitiesByID<T>;
  allIDs: string[];
}

export interface EntityState<T> {
  entities: EntityStateData<T>;
  status: StoreStatus;
  error?: string;
}
