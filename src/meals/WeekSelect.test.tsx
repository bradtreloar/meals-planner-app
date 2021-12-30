import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {DateTime, Settings as LuxonSettings} from 'luxon';
import WeekSelect from './WeekSelect';

beforeEach(() => {
  LuxonSettings.defaultZone = 'utc';
  // Mock the current time to midnight on Monday 3 January 2000.
  const mockNow = DateTime.utc(2000, 1, 3, 0, 0, 0, 0);
  LuxonSettings.now = () => mockNow.toMillis();
});

it('advances the date by one week when the user presses the "next week" button', () => {
  const testStartDate = DateTime.utc().startOf('day');
  const mockOnChange = jest.fn();
  const {getByA11yLabel} = render(
    <WeekSelect startDate={testStartDate} onChange={mockOnChange} />,
  );
  fireEvent(getByA11yLabel(/next week/i), 'onPress');
  expect(mockOnChange).toHaveBeenCalledWith(testStartDate.plus({days: 7}));
});

it('retreats the date by one week when the user presses the "previous week" button', () => {
  const testStartDate = DateTime.utc().startOf('day');
  const mockOnChange = jest.fn();
  const {getByA11yLabel} = render(
    <WeekSelect startDate={testStartDate} onChange={mockOnChange} />,
  );
  fireEvent(getByA11yLabel(/previous week/i), 'onPress');
  expect(mockOnChange).toHaveBeenCalledWith(testStartDate.minus({days: 7}));
});
