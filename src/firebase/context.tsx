import React, {createContext, useCallback, useEffect} from 'react';
import {entityReducers, useThunkDispatch} from 'src/store/createStore';
import database, {FirebaseDatabaseTypes} from '@react-native-firebase/database';
import {useAuth} from 'src/auth/context';

export interface FirebaseContextState {}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined,
);

export const FirebaseProvider: React.FC = ({children}) => {
  const dispatch = useThunkDispatch();
  const {user} = useAuth();
  const entityTypes = Object.keys(entityReducers);

  /**
   * Sets new entity state in Redux store, given firebase data snapshot.
   */
  const onValueChange = useCallback(
    (entityType: string) => (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      dispatch({
        type: `/${entityType}/set`,
        payload: snapshot.val(),
      });
    },
    [dispatch],
  );

  /**
   * Listen for changes to entity data on firebase.
   */
  useEffect(() => {
    if (user !== null) {
      entityTypes.forEach(entityType => {
        const node = `users/${user.uid}/value`;
        database().ref(node).on('value', onValueChange(entityType));
      });

      return () => {
        entityTypes.forEach(entityType => {
          const node = `users/${user.uid}/value`;
          database().ref(node).off('value', onValueChange(entityType));
        });
      };
    }
  }, [user, entityTypes, dispatch, onValueChange]);

  return (
    <FirebaseContext.Provider value={{}}>{children}</FirebaseContext.Provider>
  );
};

export default FirebaseProvider;
