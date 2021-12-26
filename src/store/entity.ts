import {addEntity, updateEntity} from '@app/firebase/database';
import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createSlice,
  Draft,
  isPending,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import {StoreStatus} from '.';

export interface Timestamps {
  created: string;
  updated: string;
}

export interface Entity extends Timestamps {
  id: string;
  isSoftDeleted: boolean;
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

export const emptyEntityState = <T>() =>
  ({
    entities: {
      byID: {},
      allIDs: [],
    },
    status: 'idle',
  } as EntityState<T>);

export const createEntitySlice = <A>(
  name: string,
  extraReducers?: (
    builder: ActionReducerMapBuilder<EntityState<EntityType<A>>>,
  ) => void,
) => {
  const asyncActions = createAsyncEntityActions<A>(name);
  const slice = createSlice({
    name,
    initialState: emptyEntityState<EntityType<A>>(),
    reducers: {
      clear() {
        return emptyEntityState<EntityType<A>>();
      },
      set(state, action: PayloadAction<EntityState<EntityType<A>>>) {
        return action.payload;
      },
    },
    extraReducers: builder => {
      if (extraReducers) {
        extraReducers(builder);
      }

      builder.addCase(asyncActions.add.fulfilled, (state, action) => {
        const entity = action.payload;
        state.entities.byID[entity.id] = entity as Draft<EntityType<A>>;
        state.entities.allIDs.push(entity.id);
      });

      builder.addCase(asyncActions.update.fulfilled, (state, action) => {
        const entity = action.payload;
        state.entities.byID[entity.id] = entity as Draft<EntityType<A>>;
      });

      builder
        .addMatcher(isPending, state => {
          state.status = 'pending';
        })
        .addMatcher(isRejected, (state, action) => {
          state.status = 'rejected';
          state.error = action.error.message;
        });
    },
  });

  return {
    ...slice,
    actions: {
      ...slice.actions,
      ...asyncActions,
    },
  };
};

export const createAsyncEntityActions = <A>(entityType: string) => ({
  add: createAsyncThunk(
    `${entityType}/add`,
    async (attributes: A) => await addEntity(entityType, attributes),
  ),
  update: createAsyncThunk(
    `${entityType}/update`,
    async (entity: EntityType<A>) => await updateEntity(entityType, entity),
  ),
});
