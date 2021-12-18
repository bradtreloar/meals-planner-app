import React from 'react';
import {StyleSheet, Text, TextInput} from 'react-native';
import {FormControlProps} from '.';

interface TextInputWrapperProps extends FormControlProps {
  name: string;
  type?: 'password';
  value: string;
  label?: string;
  placeholder?: string;
  onChangeText: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  onFocus?: (name: string) => void;
}

const TextInputWrapper: React.FC<TextInputWrapperProps> = ({
  name,
  type,
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
    <>
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
        secureTextEntry={type === 'password'}
        onChangeText={newValue => onChangeText(name, newValue)}
        onBlur={onBlur && (() => onBlur(name))}
        onFocus={onFocus && (() => onFocus(name))}
      />
      {feedback && (
        <Text
          style={[
            styles.feedback,
            isValid
              ? styles.validFeedback
              : isInvalid
              ? styles.invalidFeedback
              : {},
          ]}>
          {feedback}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: {},
  textInput: {},
  validTextInput: {},
  invalidTextInput: {},
  feedback: {},
  validFeedback: {},
  invalidFeedback: {},
});

export default TextInputWrapper;
