import React from 'react';
import {DateTime} from 'luxon';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '@app/auth/login/LoginScreen';
import HomeScreen from '@app/home/HomeScreen';
import {useAuth} from '@app/auth/context';

export type RootStackParamList = {
  MealsPlanner: {};
  SelectRecipe: {
    mealDate: DateTime;
  };
};

export interface RootStackProps {
  navigator: ReturnType<typeof createNativeStackNavigator>;
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
