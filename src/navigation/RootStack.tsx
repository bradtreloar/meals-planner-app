import React from 'react';
import {StackNavigator} from '@app/App';
import LoginScreen from '@app/auth/login/LoginScreen';
import HomeScreen from '@app/home/HomeScreen';
import {useAuth} from '@app/auth/context';

export interface RootStackProps {
  navigator: typeof StackNavigator;
}

const RootStack: React.FC<RootStackProps> = ({navigator: Stack}) => {
  const {isAuthenticated} = useAuth();

  return (
    <Stack.Navigator initialRouteName="Home">
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: 'Log in',
              // Push when signing in, pop when signing out.
              animationTypeForReplace: isAuthenticated ? 'push' : 'pop',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootStack;
