import React from 'react';
import {DateTime} from 'luxon';
import {FlatList, Text, TouchableOpacity} from 'react-native';

export type MealSlot = {
  date: DateTime;
  mealID?: string;
  recipeTitle?: string;
};

interface MealSlotListItemProps {
  mealSlot: MealSlot;
  onPress: (mealSlot: MealSlot) => void;
}

const MealSlotListItem: React.FC<MealSlotListItemProps> = ({
  mealSlot,
  onPress,
}) => (
  <TouchableOpacity testID="meal-list-item" onPress={() => onPress(mealSlot)}>
    {mealSlot.mealID ? (
      <Text>{mealSlot.recipeTitle}</Text>
    ) : (
      <Text>+ Add meal</Text>
    )}
  </TouchableOpacity>
);

interface MealsListProps {
  mealSlots: MealSlot[];
  onPress: (mealSlot: MealSlot) => void;
}

const MealsList: React.FC<MealsListProps> = ({mealSlots, onPress}) => (
  <FlatList
    data={mealSlots.map(mealSlot => ({
      mealSlot,
      onPress,
    }))}
    renderItem={({item}) => <MealSlotListItem {...item} />}
  />
);

export default MealsList;
