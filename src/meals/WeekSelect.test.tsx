import {fireEvent, render} from '@testing-library/react-native';
import {DateTime} from 'luxon';
import React from 'react';
import WeekSelect from './WeekSelect';

it('advances the date by one week when the user presses the "next week" button', () => {
  const testStartDate = DateTime.utc();
  const mockOnChange = jest.fn();
  const {getByA11yLabel} = render(
    <WeekSelect startDate={testStartDate} onChange={mockOnChange} />,
  );
  fireEvent(getByA11yLabel(/next week/i), 'onPress');
  expect(mockOnChange).toHaveBeenCalledWith(testStartDate.plus({days: 7}));
});

it('retreats the date by one week when the user presses the "previous week" button', () => {
  const testStartDate = DateTime.utc();
  const mockOnChange = jest.fn();
  const {getByA11yLabel} = render(
    <WeekSelect startDate={testStartDate} onChange={mockOnChange} />,
  );
  fireEvent(getByA11yLabel(/previous week/i), 'onPress');
  expect(mockOnChange).toHaveBeenCalledWith(testStartDate.minus({days: 7}));
});
