import React, {useMemo} from 'react';
import {DateTime} from 'luxon';
import {Button, Text, View} from 'react-native';

interface WeekSelectProps {
  startDate: DateTime;
  onChange: (newStartDate: DateTime) => void;
}

const WeekSelect: React.FC<WeekSelectProps> = ({startDate, onChange}) => {
  const endDate = useMemo(() => startDate.plus({days: 6}), [startDate]);
  const startDateLabel = useMemo(
    () => startDate.toLocaleString(DateTime.DATETIME_SHORT),
    [startDate],
  );
  const endDateLabel = useMemo(
    () => endDate.toLocaleString(DateTime.DATETIME_SHORT),
    [endDate],
  );

  return (
    <View>
      <Button
        title="<"
        accessibilityLabel="Previous week"
        onPress={() => onChange(startDate.minus({days: 7}))}
      />
      <Text>
        {startDateLabel} - {endDateLabel}
      </Text>
      <Button
        title=">"
        accessibilityLabel="Next week"
        onPress={() => onChange(startDate.plus({days: 7}))}
      />
    </View>
  );
};

export default WeekSelect;
