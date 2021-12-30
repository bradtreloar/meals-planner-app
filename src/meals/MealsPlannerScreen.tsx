import React, {useMemo, useState} from 'react';
import {RootStackParamList} from '@app/navigation/RootStack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DateTime} from 'luxon';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {range, values} from 'lodash';
import MealSlotList, {MealSlot} from '@app/meals/MealSlotList';
import {selectMeals, actions as mealActions} from '@app/meals/store';
import {Meal} from '@app/meals/types';
import WeekSelect from '@app/meals/WeekSelect';
import {selectRecipes} from '@app/recipes/store';
import {useThunkDispatch} from '@app/store/createStore';

export interface MealsPlannerScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'MealsPlanner'> {}

const initialStartDate = () =>
  DateTime.fromObject({hour: 0, minute: 0, second: 0, millisecond: 0});

const MealsPlannerScreen: React.FC<MealsPlannerScreenProps> = ({
  navigation,
}) => {
  const dispatch = useThunkDispatch();
  const meals = useSelector(selectMeals).entities.byID;
  const recipes = useSelector(selectRecipes).entities.byID;
  const [startDate, setStartDate] = useState(initialStartDate());
  // Select the meals in the current week, and store them in an object keyed by
  // their position in the week.
  const selectedMeals = useMemo(() => {
    const filteredMeals = values(meals).filter(meal => {
      const daysDiff = DateTime.fromISO(meal.date).diff(startDate).days;
      return daysDiff >= 0 && daysDiff < 7;
    });
    return filteredMeals.reduce((sortedMeals, meal) => {
      const day = DateTime.fromISO(meal.date).diff(startDate).days.toString();
      sortedMeals[day] = meal;
      return sortedMeals;
    }, {} as {[key: string]: Meal});
  }, [meals, startDate]);
  const mealSlots: MealSlot[] = useMemo(
    () =>
      range(7).map(day => {
        const date = startDate.plus({days: day});
        const key = day.toString();
        if (key in selectedMeals) {
          const meal = selectedMeals[key];
          return {
            date,
            mealID: meal.id,
            recipeTitle: recipes[meal.recipeID].title,
          };
        }
        return {
          date: date,
        };
      }),
    [selectedMeals, recipes, startDate],
  );

  async function handleSelectMealSlot(mealSlot: MealSlot) {
    // Either delete the existing meal or open the recipe select screen to
    // add a meal.
    if (mealSlot.mealID !== undefined) {
      await dispatch(mealActions.delete(meals[mealSlot.mealID]));
    } else {
      navigation.navigate('SelectRecipe', {mealDate: mealSlot.date});
    }
  }

  return (
    <View>
      <WeekSelect startDate={startDate} onChange={setStartDate} />
      <MealSlotList mealSlots={mealSlots} onPress={handleSelectMealSlot} />
    </View>
  );
};

export default MealsPlannerScreen;
