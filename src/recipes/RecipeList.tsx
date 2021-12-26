import {Recipe} from '@app/types';
import {orderBy} from 'lodash';
import React, {useMemo} from 'react';
import {FlatList, Text, TouchableOpacity} from 'react-native';

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
    onPress={() => onPress(recipe)}
    onLongPress={() => onLongPress(recipe)}>
    <Text testID="recipe-list-item-text">{recipe.title}</Text>
  </TouchableOpacity>
);

interface RecipeSelectListProps {
  recipes: Recipe[];
  onPress: (recipe: Recipe) => void;
  onLongPress: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeSelectListProps> = ({
  recipes,
  onPress,
  onLongPress,
}) => {
  const sortedRecipes = useMemo(
    () => orderBy(recipes, ['title'], ['asc']),
    [recipes],
  );

  return (
    <FlatList
      data={sortedRecipes.map(recipe => ({
        recipe,
        onPress,
        onLongPress,
      }))}
      renderItem={({item}) => <RecipeListItem {...item} />}
    />
  );
};

export default RecipeList;
