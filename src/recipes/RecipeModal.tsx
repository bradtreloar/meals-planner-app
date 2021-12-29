import {pick} from 'lodash';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Modal from 'react-native-modal';
import RecipeForm, {RecipeFormValues} from './RecipeForm';
import {Recipe} from './types';

interface RecipeModalProps {
  recipe: Recipe | null;
  isVisible: boolean;
  onSubmit: (values: RecipeFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  recipe,
  isVisible,
  onCancel,
  onSubmit,
  onDelete,
}) => {
  const defaultValues = useMemo(
    () => (recipe !== null ? pick(recipe, ['title']) : undefined),
    [recipe],
  );

  return (
    <Modal
      testID="recipe-modal"
      isVisible={isVisible}
      hasBackdrop
      onBackButtonPress={onCancel}
      onBackdropPress={onCancel}>
      <View>
        <RecipeForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      </View>
    </Modal>
  );
};

export default RecipeModal;
