import React from 'react';
import useFormController from '@app/common/forms/useFormController';
import {View, Text, StyleSheet} from 'react-native';
import {useAuth} from '../context';
import LoginForm, {LoginFormValues} from './LoginForm';
import {NavigationStackScreenProps} from 'react-navigation-stack';
import {feedbackStyles} from '@app/common/forms/styles';

const LoginScreen: React.FC<NavigationStackScreenProps> = () => {
  const {login} = useAuth();
  const {formError, formPending, handleSubmit} = useFormController(
    async (values: LoginFormValues) => {
      await login(values.email, values.password);
    },
  );

  return (
    <View>
      <Text style={styles.title}>Meals Planner</Text>
      <Text style={styles.formTitle}>Log in</Text>
      {formError && (
        <View style={styles.feedbackContainer}>
          <Text style={feedbackStyles.invalid}>{formError}</Text>
        </View>
      )}
      <LoginForm onSubmit={handleSubmit} isPending={formPending} />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  formTitle: {
    fontSize: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  feedbackContainer: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});

export default LoginScreen;
