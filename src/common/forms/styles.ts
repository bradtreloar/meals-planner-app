import {StyleSheet} from 'react-native';
import {colors} from '@app/common/styles/variables';

export const feedbackStyles = StyleSheet.create({
  valid: {
    fontSize: 14,
    color: colors.feedback.success,
  },
  invalid: {
    fontSize: 14,
    color: colors.feedback.error,
  },
});
