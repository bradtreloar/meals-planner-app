import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

export interface FormContainerProps {
  style?: StyleProp<ViewStyle>;
}

const FormContainer: React.FC<FormContainerProps> = ({children, style}) => (
  <View style={[styles.formContainer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  formContainer: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 24,
  },
});

export default FormContainer;
