/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import ProfileDetails from '../components/ProfileDetails';
import ProfileEdit from '../components/ProfileEdit';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const UserInfo = ({ session }) => {
  return (
    <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
        <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
        <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
    </Stack.Navigator>
  );
}

export default UserInfo;
