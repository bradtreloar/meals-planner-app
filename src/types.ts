export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  emailVerified: boolean;
}

export type StoreStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface Timestamps {
  created: string;
  changed: string;
}

export interface Entity extends Timestamps {
  id: string;
}

export interface EntitiesObject<T> {
  [key: string]: T;
}

export interface EntityStateData<T> {
  byID: EntitiesObject<T>;
  allIDs: string[];
}

export interface EntityState<T> {
  entities: EntityStateData<T>;
  status: StoreStatus;
  error?: string;
}

export interface RecipeAttributes {
  title: string;
}

export interface Recipe extends Entity, RecipeAttributes {}
