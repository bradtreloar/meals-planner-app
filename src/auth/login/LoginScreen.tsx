import React from 'react';
import useFormController from '@app/common/forms/useFormController';
import {View, Text, StyleSheet} from 'react-native';
import {useAuth} from '../context';
import LoginForm, {LoginFormValues} from './LoginForm';
import {NavigationStackScreenProps} from 'react-navigation-stack';

const LoginScreen: React.FC<NavigationStackScreenProps> = () => {
  const {login} = useAuth();
  const {formError, formPending, handleSubmit} = useFormController(
    async (values: LoginFormValues) => {
      await login(values.email, values.password);
    },
  );

  return (
    <View style={styles.viewStyle}>
      <Text>Log in</Text>
      {formError && (
        <Text style={[styles.feedback, styles.invalidFeedback]}>
          {formError}
        </Text>
      )}
      <LoginForm onSubmit={handleSubmit} isPending={formPending} />
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {},
  validFeedback: {},
  invalidFeedback: {},
});

export default LoginScreen;
