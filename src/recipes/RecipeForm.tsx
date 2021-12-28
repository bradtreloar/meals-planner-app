import React from 'react';
import useForm from '@app/common/forms/useForm';
import TextInputWrapper from '@app/common/forms/TextInputWrapper';
import {Button, View} from 'react-native';

export type RecipeFormValues = {
  title: string;
};

const validate = (values: any) => {
  const errors = {} as {[key: string]: string};
  const {title} = values;

  if (title === '') {
    errors.title = 'Required';
  }

  return errors;
};

const initialValues: RecipeFormValues = {
  title: '',
};

interface RecipeFormProps {
  defaultValues?: RecipeFormValues;
  onSubmit: (values: RecipeFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isPending?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  onDelete,
  isPending,
}) => {
  const isNewRecipe = defaultValues === undefined;
  const {
    values,
    errors,
    visibleErrors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(isNewRecipe ? initialValues : defaultValues, onSubmit, validate);

  return (
    <View>
      <TextInputWrapper
        label="Recipe Name"
        name="title"
        value={values.title}
        feedback={visibleErrors.title && errors.title}
        isInvalid={visibleErrors.title}
        onChangeText={handleChange}
        onBlur={handleBlur}
        isDisabled={isPending}
      />
      <Button
        title="Save"
        accessibilityLabel="Save"
        testID="recipe-form-submit-button"
        onPress={handleSubmit}
        disabled={isPending}
      />
      <Button
        title="Cancel"
        accessibilityLabel="Cancel"
        testID="recipe-form-cancel-button"
        onPress={onCancel}
        disabled={isPending}
      />
      {onDelete !== undefined && (
        <Button
          title="Delete"
          accessibilityLabel="Delete"
          testID="recipe-form-delete-button"
          onPress={onDelete}
          disabled={isPending}
        />
      )}
    </View>
  );
};

export default RecipeForm;
