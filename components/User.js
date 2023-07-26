/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import SignUpSlider from '../components/SignUpSlider';
import UserStack from '../components/UserStack';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const User = ({ session }) => {
  return (
    <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
        <Stack.Screen name="UserStack">
            {(props) => <UserStack {...props} session={session} />}
        </Stack.Screen>
        <Stack.Screen name="SignUpSlider" component={SignUpSlider} />
    </Stack.Navigator>
  );
};

export default User;
