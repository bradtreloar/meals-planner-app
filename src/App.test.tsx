import React from 'react';
import {waitFor, render, act} from '@testing-library/react-native';
import App from './App';
import * as firebase from '@app/firebase/auth';
import {noop} from 'lodash';
import {User} from './auth/types';
jest.mock('@app/firebase/auth');

let testGlobals = {
  refreshUserCallback: noop as (user: User | null) => void,
};

function triggerAuthStateChange(user: User | null) {
  act(() => {
    testGlobals.refreshUserCallback(user);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(firebase, 'onAuthStateChanged')
    .mockImplementation((refreshUserCallback: (user: User | null) => void) => {
      testGlobals.refreshUserCallback = refreshUserCallback;
      return () => undefined;
    });
});

it('renders without crashing', async () => {
  await waitFor(async () => render(<App />));
  triggerAuthStateChange(null);
});
