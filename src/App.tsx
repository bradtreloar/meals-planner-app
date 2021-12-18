import React from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider, useAuth} from '@app/auth/context';
import RootStack from '@app/navigation/RootStack';

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
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default AppWrapper;
