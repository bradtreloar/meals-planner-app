import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from 'src/common/styles/variables';

const SplashScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Meals Planner</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: colors.green,
    color: colors.white,
  },
  title: {
    color: colors.white,
    fontSize: 36,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
