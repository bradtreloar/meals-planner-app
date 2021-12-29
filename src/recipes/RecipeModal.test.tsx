import {render, waitFor} from '@testing-library/react-native';
import {noop} from 'lodash';
import React from 'react';
import {View} from 'react-native';
import {fakeRecipe} from './factory';
import RecipeModal from './RecipeModal';
import {Recipe} from './types';

interface RecipeModalFixtureProps {
  recipe: Recipe;
}

beforeAll(() => {
  jest.useFakeTimers();
});

const RecipeModalFixture: React.FC<RecipeModalFixtureProps> = ({recipe}) => {
  return (
    <View testID="recipe-modal-fixture">
      <RecipeModal recipe={recipe} isVisible onCancel={noop} onSubmit={noop} />
    </View>
  );
};

it('renders', async () => {
  const testRecipe = fakeRecipe();
  const {getByTestId} = await waitFor(() =>
    render(<RecipeModalFixture recipe={testRecipe} />),
  );

  getByTestId('recipe-modal');
});
