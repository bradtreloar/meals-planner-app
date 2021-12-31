import {EntityType} from 'src/store/types';

export interface RecipeAttributes {
  title: string;
  isSoftDeleted: boolean;
}

export type Recipe = EntityType<RecipeAttributes>;
