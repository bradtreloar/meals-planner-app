import {addEntity, deleteEntity, updateEntity} from 'src/firebase/database';
import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createSlice,
  Draft,
  isPending,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import {Entity, EntityState, EntityType} from './types';

export const emptyEntityState = <T>() =>
  ({
    entities: {
      byID: {},
      allIDs: [],
    },
    status: 'idle',
  } as EntityState<T>);

export const buildEntityState = <T extends Entity>(entities: T[]) =>
  entities.reduce((entityState, entity) => {
    entityState.entities.byID[entity.id] = entity;
    entityState.entities.allIDs.push(entity.id);
    return entityState;
  }, emptyEntityState<T>());

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

      builder.addCase(asyncActions.delete.fulfilled, (state, action) => {
        const entity = action.payload;
        delete state.entities.byID[entity.id];
        state.entities.allIDs = state.entities.allIDs.filter(
          id => id !== entity.id,
        );
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
  delete: createAsyncThunk(
    `${entityType}/delete`,
    async (entity: EntityType<A>) => await deleteEntity(entityType, entity),
  ),
});
