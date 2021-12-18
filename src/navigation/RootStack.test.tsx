import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RootStack from './RootStack';
import {render, waitFor} from '@testing-library/react-native';
import {AuthContext} from '@app/auth/context';
import {fakeAuthContextState, fakeUser} from '@app/auth/factory';

it('shows the LoginScreen when user is not authenticated', async () => {
  const testStackNavigator = createNativeStackNavigator();

  const {getByTestId} = await waitFor(async () =>
    render(
      <AuthContext.Provider value={fakeAuthContextState(null)}>
        <NavigationContainer>
          <RootStack navigator={testStackNavigator} />
        </NavigationContainer>
      </AuthContext.Provider>,
    ),
  );

  getByTestId('login-form-submit-button');
});

it('shows the HomeScreen when user is authenticated', async () => {
  const testUser = fakeUser();
  const testStackNavigator = createNativeStackNavigator();

  const {getByText} = await waitFor(async () =>
    render(
      <AuthContext.Provider value={fakeAuthContextState(testUser)}>
        <NavigationContainer>
          <RootStack navigator={testStackNavigator} />
        </NavigationContainer>
      </AuthContext.Provider>,
    ),
  );

  getByText(/home/i);
});
