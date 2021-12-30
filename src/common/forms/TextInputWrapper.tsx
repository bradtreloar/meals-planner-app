import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {FormControlProps} from '.';
import {colors} from '../styles/variables';
import {feedbackStyles} from './styles';

interface TextInputWrapperProps extends FormControlProps {
  name: string;
  isPassword?: boolean;
  value: string;
  label?: string;
  placeholder?: string;
  onChangeText: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  onFocus?: (name: string) => void;
}

const TextInputWrapper: React.FC<TextInputWrapperProps> = ({
  name,
  isPassword,
  value,
  label,
  placeholder,
  onChangeText,
  onBlur,
  onFocus,
  feedback,
  isValid,
  isInvalid,
  isDisabled,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        accessibilityLabel={label}
        style={[
          styles.textInput,
          isValid
            ? styles.validTextInput
            : isInvalid
            ? styles.invalidTextInput
            : {},
        ]}
        value={value}
        placeholder={placeholder}
        editable={!isDisabled}
        secureTextEntry={isPassword}
        onChangeText={newValue => onChangeText(name, newValue)}
        onBlur={onBlur && (() => onBlur(name))}
        onFocus={onFocus && (() => onFocus(name))}
      />
      {feedback && (
        <Text
          style={[
            styles.feedback,
            isValid
              ? feedbackStyles.valid
              : isInvalid
              ? feedbackStyles.invalid
              : {},
          ]}>
          {feedback}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  label: {
    paddingBottom: 8,
  },
  textInput: {
    backgroundColor: colors.white,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    padding: 4,
  },
  validTextInput: {
    borderColor: colors.feedback.success,
  },
  invalidTextInput: {
    borderColor: colors.feedback.error,
  },
  feedback: {
    paddingTop: 4,
  },
});

export default TextInputWrapper;
