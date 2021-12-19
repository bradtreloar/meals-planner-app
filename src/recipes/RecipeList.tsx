import {Recipe} from '@app/types';
import React from 'react';
import {FlatList, Text, TouchableOpacity} from 'react-native';

interface RecipeListItemProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
}

const RecipeListItem: React.FC<RecipeListItemProps> = ({recipe, onPress}) => (
  <TouchableOpacity onPress={() => onPress(recipe)}>
    <Text>{recipe.title}</Text>
  </TouchableOpacity>
);

interface RecipeSelectListProps {
  recipes: Recipe[];
  onPress: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeSelectListProps> = ({recipes, onPress}) => (
  <FlatList
    data={recipes.map(recipe => ({
      recipe,
      onPress,
    }))}
    renderItem={({item}) => <RecipeListItem {...item} />}
  />
);

export default RecipeList;
