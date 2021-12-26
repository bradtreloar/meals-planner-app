import React from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import {AuthProvider, useAuth} from '@app/auth/context';
import RootStack from '@app/navigation/RootStack';
import createStore from '@app/store';

export const StackNavigator = createNativeStackNavigator();

export const store = createStore();

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
        <NavigationContainer>
          <App />
        </NavigationContainer>
      </Provider>
    </AuthProvider>
  );
};

export default AppWrapper;
