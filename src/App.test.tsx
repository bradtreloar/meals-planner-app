import React from 'react';
import {waitFor, render} from '@testing-library/react-native';
import App from './App';

it('renders without crashing', async () => {
  await waitFor(async () => render(<App />));
});
