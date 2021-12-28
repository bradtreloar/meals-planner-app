import React, {useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import RecipesList from './RecipesList';
import FloatingButton from '@app/common/FloatingButton';
import {useSelector} from 'react-redux';
import {Recipe, selectRecipes, actions as recipeActions} from './store';
import {EntityState} from '@app/store/entity';
import {merge, orderBy, values} from 'lodash';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useThunkDispatch} from '@app/store/createStore';
import {actions as mealActions} from '@app/meals/store';
import {RootStackParamList} from '@app/navigation/RootStack';
import RecipeModal from './RecipeModal';
import {RecipeFormValues} from './RecipeForm';

export interface RecipesScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'SelectRecipe'> {}

const RecipesScreen: React.FC<RecipesScreenProps> = ({route, navigation}) => {
  const dispatch = useThunkDispatch();
  const recipesState: EntityState<Recipe> = useSelector(selectRecipes);
  // Filter out soft-deleted recipes and sort alphabetically by title.
  const sortedRecipes = useMemo(() => {
    const visibleRecipes = values(recipesState.entities.byID).filter(
      recipe => !recipe.isSoftDeleted,
    );
    return orderBy(visibleRecipes, ['title'], ['asc']);
  }, [recipesState]);
  const {mealDate} = route.params;
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [addingRecipe, setAddingRecipe] = useState(false);
  const recipeModalVisible = addingRecipe || editingRecipe !== null;

  async function handleSelectRecipe(recipe: Recipe) {
    await dispatch(
      mealActions.add({
        date: mealDate.toISO(),
        recipeID: recipe.id,
      }),
    );
    navigation.goBack();
  }

  function handleEditRecipe(recipe: Recipe) {
    setEditingRecipe(recipe);
  }

  function handleAddRecipe() {
    setAddingRecipe(true);
  }

  function handleCloseRecipeModal() {
    if (editingRecipe !== null) {
      setEditingRecipe(null);
    }
  }

  async function handleSaveRecipe(formValues: RecipeFormValues) {
    if (editingRecipe !== null) {
      const updatedRecipe = merge(editingRecipe, formValues);
      await dispatch(recipeActions.update(updatedRecipe));
      setEditingRecipe(null);
    } else {
      await dispatch(recipeActions.add(formValues));
      setAddingRecipe(false);
    }
  }

  async function handleDeleteRecipe() {
    if (editingRecipe !== null) {
      const updatedRecipe = merge(editingRecipe, {isSoftDeleted: true});
      await dispatch(recipeActions.update(updatedRecipe));
      setEditingRecipe(null);
    } else {
      throw new Error('Cannot delete undefined recipe.');
    }
  }

  return (
    <View style={styles.viewStyle}>
      <RecipeModal
        isVisible={recipeModalVisible}
        recipe={editingRecipe}
        onSubmit={handleSaveRecipe}
        onCancel={handleCloseRecipeModal}
        onDelete={editingRecipe !== null ? handleDeleteRecipe : undefined}
      />
      <RecipesList
        recipes={sortedRecipes}
        onPress={handleSelectRecipe}
        onLongPress={handleEditRecipe}
      />
      <FloatingButton
        title="+"
        accessibilityLabel="Add Recipe"
        onPress={handleAddRecipe}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecipesScreen;
