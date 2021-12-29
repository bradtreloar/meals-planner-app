import React from 'react';
import {FlatList, Text, TouchableOpacity} from 'react-native';
import {Recipe} from './types';

interface RecipeListItemProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onLongPress: (recipe: Recipe) => void;
}

const RecipeListItem: React.FC<RecipeListItemProps> = ({
  recipe,
  onPress,
  onLongPress,
}) => (
  <TouchableOpacity
    testID="recipe-list-item"
    onPress={() => onPress(recipe)}
    onLongPress={() => onLongPress(recipe)}>
    <Text>{recipe.title}</Text>
  </TouchableOpacity>
);

interface RecipeSelectListProps {
  recipes: Recipe[];
  onPress: (recipe: Recipe) => void;
  onLongPress: (recipe: Recipe) => void;
}

const RecipesList: React.FC<RecipeSelectListProps> = ({
  recipes,
  onPress,
  onLongPress,
}) => (
  <FlatList
    data={recipes.map(recipe => ({
      recipe,
      onPress,
      onLongPress,
    }))}
    renderItem={({item}) => <RecipeListItem {...item} />}
  />
);

export default RecipesList;
