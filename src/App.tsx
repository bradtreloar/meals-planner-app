import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import {AuthProvider, useAuth} from 'src/auth/context';
import RootStack from 'src/navigation/RootStack';
import createStore from 'src/store/createStore';
import SplashScreen from 'src/SplashScreen';

export const StackNavigator = createNativeStackNavigator();

export const store = createStore();

const App: React.FC = () => {
  const {userInitialised} = useAuth();
  const isLoading = !userInitialised;

  if (isLoading) {
    return <SplashScreen />;
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
