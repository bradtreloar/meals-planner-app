import React from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import firebase from '@react-native-firebase/app';
import {ReactReduxFirebaseProvider} from 'react-redux-firebase';
import {AuthProvider, useAuth} from '@app/auth/context';
import RootStack from '@app/navigation/RootStack';
import store from '@app/store';

export const StackNavigator = createNativeStackNavigator();

const App: React.FC = () => {
  const {userInitialised} = useAuth();
  const isLoading = !userInitialised;

  if (isLoading) {
    return (
      <View>
        <Text>Splash</Text>
      </View>
    );
  }

  return <RootStack navigator={StackNavigator} />;
};

const AppWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <Provider store={store}>
        <ReactReduxFirebaseProvider
          firebase={firebase}
          dispatch={store.dispatch}
          config={{
            userProfile: 'users',
          }}>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </ReactReduxFirebaseProvider>
      </Provider>
    </AuthProvider>
  );
};

export default AppWrapper;
