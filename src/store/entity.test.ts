import {configureStore} from '@reduxjs/toolkit';
import faker from 'faker';
import {range, values} from 'lodash';
import {createEntitySlice, emptyEntityState} from './entity';
import * as firebaseDatabase from '@app/firebase/database';
import {EntityState, EntityStateData, EntityType} from './types';
jest.mock('@app/firebase/database');

interface MockEntityAttributes {
  title: string;
}

type MockEntity = EntityType<MockEntityAttributes>;

const MOCK_ENTITY_TYPE = 'mockEntities' as const;

const createMockStore = () => {
  const {actions, reducer} =
    createEntitySlice<MockEntityAttributes>(MOCK_ENTITY_TYPE);
  const store = configureStore({
    reducer: {
      [MOCK_ENTITY_TYPE]: reducer,
    },
  });
  return {actions, store};
};

const randomMockEntityState = (
  entityCount: number,
): EntityState<MockEntity> => {
  const entityStateData = range(entityCount).reduce(
    entities => {
      const entity = randomMockEntity();
      entities.byID[entity.id] = entity;
      entities.allIDs.push(entity.id);
      return entities;
    },
    {
      byID: {},
      allIDs: [],
    } as EntityStateData<MockEntity>,
  );

  return {
    entities: entityStateData,
    status: 'idle',
  };
};

const randomMockEntity = (): MockEntity => ({
  id: faker.datatype.uuid(),
  title: faker.random.words(3),
  created: '',
  updated: '',
});

const mockEntityActions = {
  set: (payload: EntityState<MockEntity>) => ({
    type: `${MOCK_ENTITY_TYPE}/set`,
    payload,
  }),
  clear: () => ({
    type: `${MOCK_ENTITY_TYPE}/clear`,
  }),
  add: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function seedStore(entityCount: number = 1) {
  const {actions, store} = createMockStore();
  store.dispatch({
    type: `${MOCK_ENTITY_TYPE}/set`,
    payload: randomMockEntityState(entityCount),
  });
  return {actions, store};
}

describe('synchronous actions', () => {
  test('create set action when "set" action creator is called', () => {
    const {actions} = createEntitySlice(MOCK_ENTITY_TYPE);
    const payload = randomMockEntityState(1);
    const action = actions.set(payload);
    expect(action).toStrictEqual({
      type: `${MOCK_ENTITY_TYPE}/set`,
      payload,
    });
  });

  test('create clear action when "clear" action creator is called', () => {
    const {actions} = createEntitySlice(MOCK_ENTITY_TYPE);
    const action = actions.clear();
    expect(action).toStrictEqual({
      type: `${MOCK_ENTITY_TYPE}/clear`,
      payload: undefined,
    });
  });
});

describe('asynchronous thunk actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('create add/fulfilled action when "add" thunk action creator is dispatched', async () => {
    const {actions, store} = seedStore(0);
    const testMockEntity = randomMockEntity();
    jest.spyOn(firebaseDatabase, 'addEntity').mockResolvedValue(testMockEntity);
    const action = await store.dispatch(
      actions.add({
        title: testMockEntity.title,
      }),
    );
    expect(firebaseDatabase.addEntity).toHaveBeenCalledWith(MOCK_ENTITY_TYPE, {
      title: testMockEntity.title,
    });
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/add/fulfilled`);
    expect(action.payload).toBe(testMockEntity);
  });

  test('create update/fulfilled action when "update" thunk action creator is dispatched', async () => {
    const {actions, store} = seedStore(0);
    const testMockEntity = randomMockEntity();
    jest
      .spyOn(firebaseDatabase, 'updateEntity')
      .mockResolvedValue(testMockEntity);
    const action = await store.dispatch(actions.update(testMockEntity));
    expect(firebaseDatabase.updateEntity).toHaveBeenCalledWith(
      MOCK_ENTITY_TYPE,
      testMockEntity,
    );
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/update/fulfilled`);
    expect(action.payload).toBe(testMockEntity);
  });

  test('create delete/fulfilled action when "delete" thunk action creator is dispatched', async () => {
    const {actions, store} = seedStore(0);
    const testMockEntity = randomMockEntity();
    jest
      .spyOn(firebaseDatabase, 'deleteEntity')
      .mockResolvedValue(testMockEntity);
    const action = await store.dispatch(actions.delete(testMockEntity));
    expect(firebaseDatabase.deleteEntity).toHaveBeenCalledWith(
      MOCK_ENTITY_TYPE,
      testMockEntity,
    );
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/delete/fulfilled`);
    expect(action.payload).toBe(testMockEntity);
  });
});

describe('reducers', () => {
  test('populate store when set action is dispatched', () => {
    const {store} = createMockStore();
    const mockEntityState = randomMockEntityState(3);
    expect(store.getState().mockEntities).toStrictEqual(emptyEntityState());
    const action = store.dispatch(mockEntityActions.set(mockEntityState));
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/set`);
    expect(store.getState().mockEntities).toStrictEqual(mockEntityState);
  });

  test('clear store when clear action is dispatched', () => {
    const {store} = seedStore(1);
    expect(store.getState().mockEntities).not.toStrictEqual(emptyEntityState());
    const action = store.dispatch(mockEntityActions.clear());
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/clear`);
    expect(store.getState().mockEntities).toStrictEqual(emptyEntityState());
  });

  test('add entity to store when add action is dispatched', async () => {
    const {store} = seedStore(0);
    expect(store.getState().mockEntities).toStrictEqual(emptyEntityState());
    const testMockEntity = randomMockEntity();
    jest.spyOn(mockEntityActions, 'add').mockReturnValue({
      type: `${MOCK_ENTITY_TYPE}/add/fulfilled`,
      payload: testMockEntity,
    });
    const action = await store.dispatch(
      mockEntityActions.add({
        title: testMockEntity.title,
      }),
    );
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/add/fulfilled`);
    expect(mockEntityActions.add).toHaveBeenCalledWith({
      title: testMockEntity.title,
    });
    const {entities} = store.getState().mockEntities;
    expect(entities.allIDs).toStrictEqual([testMockEntity.id]);
  });

  test('update entity in store when update action is dispatched', async () => {
    const {store} = seedStore(1);
    const testMockEntity = values(
      store.getState()[MOCK_ENTITY_TYPE].entities.byID,
    )[0];
    testMockEntity.title = faker.random.words(3);
    jest.spyOn(mockEntityActions, 'update').mockReturnValue({
      type: `${MOCK_ENTITY_TYPE}/update/fulfilled`,
      payload: testMockEntity,
    });
    const action = await store.dispatch(
      mockEntityActions.update(testMockEntity),
    );
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/update/fulfilled`);
    expect(mockEntityActions.update).toHaveBeenCalledWith(testMockEntity);
    const {entities} = store.getState().mockEntities;
    expect(entities.byID[testMockEntity.id]).toStrictEqual(testMockEntity);
  });

  test('delete entity from store when delete action is dispatched', async () => {
    const {store} = seedStore(1);
    const testMockEntity = values(
      store.getState()[MOCK_ENTITY_TYPE].entities.byID,
    )[0];
    jest.spyOn(mockEntityActions, 'delete').mockReturnValue({
      type: `${MOCK_ENTITY_TYPE}/delete/fulfilled`,
      payload: testMockEntity,
    });
    const action = await store.dispatch(
      mockEntityActions.delete(testMockEntity),
    );
    expect(action.type).toBe(`${MOCK_ENTITY_TYPE}/delete/fulfilled`);
    expect(mockEntityActions.delete).toHaveBeenCalledWith(testMockEntity);
    const {entities} = store.getState().mockEntities;
    expect(entities.byID[testMockEntity.id]).toBeUndefined();
    expect(entities.allIDs).toHaveLength(0);
  });
});
