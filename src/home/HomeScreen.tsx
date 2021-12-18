import * as React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {NavigationStackScreenProps} from 'react-navigation-stack';

const HomeScreen: React.FC<NavigationStackScreenProps> = ({navigation}) => {
  return (
    <View style={styles.viewStyle}>
      <Text>Home Screen</Text>
      <Button title="Log in" onPress={() => navigation.navigate('Login')} />
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

export default HomeScreen;
