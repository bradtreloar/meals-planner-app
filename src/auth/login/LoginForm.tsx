import React from 'react';
import * as EmailValidator from 'email-validator';
import useForm from 'src/common/forms/useForm';
import TextInputWrapper from 'src/common/forms/TextInputWrapper';
import FormContainer from 'src/common/forms/FormContainer';
import SubmitButton from 'src/common/forms/SubmitButton';

export type LoginFormValues = {
  email: string;
  password: string;
};

const validate = (values: any) => {
  const errors = {} as {[key: string]: string};
  const {email, password} = values;

  if (email === '') {
    errors.email = 'Required';
  } else if (EmailValidator.validate(email) === false) {
    errors.email = 'Must be a valid email address';
  }

  if (password === '') {
    errors.password = 'Required';
  }

  return errors;
};

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isPending?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({onSubmit, isPending}) => {
  const {
    values,
    errors,
    visibleErrors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues, onSubmit, validate);

  return (
    <FormContainer>
      <TextInputWrapper
        label="Email Address"
        name="email"
        value={values.email}
        feedback={visibleErrors.email && errors.email}
        isInvalid={visibleErrors.email}
        onChangeText={handleChange}
        onBlur={handleBlur}
        isDisabled={isPending}
      />
      <TextInputWrapper
        label="Password"
        name="password"
        isPassword
        value={values.password}
        feedback={visibleErrors.password && errors.password}
        isInvalid={visibleErrors.password}
        onChangeText={handleChange}
        onBlur={handleBlur}
        isDisabled={isPending}
      />
      <SubmitButton
        title={isPending ? 'Logging in' : 'Log in'}
        accessibilityLabel={isPending ? 'Logging in' : 'Log in'}
        testID="login-form-submit-button"
        onPress={handleSubmit}
        disabled={isPending}
      />
    </FormContainer>
  );
};

export default LoginForm;
