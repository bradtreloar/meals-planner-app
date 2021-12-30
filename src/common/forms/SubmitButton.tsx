import React from 'react';
import {Button, ButtonProps, StyleSheet, View} from 'react-native';

export interface SubmitButtonProps extends ButtonProps {}

const SubmitButton: React.FC<SubmitButtonProps> = props => (
  <View style={styles.container}>
    <Button {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
});

export default SubmitButton;
