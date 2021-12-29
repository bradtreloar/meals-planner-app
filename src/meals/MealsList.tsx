import React from 'react';
import {DateTime} from 'luxon';
import {FlatList, Text, TouchableOpacity} from 'react-native';

export type MealItem = {
  date: DateTime;
  mealID?: string;
  recipeTitle?: string;
};

interface MealListItemProps {
  mealItem: MealItem;
  onPress: (mealItem: MealItem) => void;
}

const MealListItem: React.FC<MealListItemProps> = ({mealItem, onPress}) => (
  <TouchableOpacity testID="meal-list-item" onPress={() => onPress(mealItem)}>
    {mealItem.mealID ? (
      <Text>{mealItem.recipeTitle}</Text>
    ) : (
      <Text>+ Add meal</Text>
    )}
  </TouchableOpacity>
);

interface MealsListProps {
  mealItems: MealItem[];
  onPress: (mealItem: MealItem) => void;
}

const MealsList: React.FC<MealsListProps> = ({mealItems, onPress}) => (
  <FlatList
    data={mealItems.map(mealItem => ({
      mealItem,
      onPress,
    }))}
    renderItem={({item}) => <MealListItem {...item} />}
  />
);

export default MealsList;
