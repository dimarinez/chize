/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import ProfileDetails from '../components/ProfileDetails';
import ProfileEdit from '../components/ProfileEdit';
import Preferences from '../components/Preferences';
import Settings from '../components/Settings';
import Subscriptions from '../components/Subscriptions';
import { createStackNavigator } from '@react-navigation/stack';
import navigateToScreen from '../PushNotification';

const Stack = createStackNavigator();

const UserInfo = ({ session, navigation, iap }) => {
  useEffect( () => {
    navigateToScreen().then(screenName => {
      if (screenName) {
        navigation.navigate(screenName);
      }
    });
  }, []);

  return (
    <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
        <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Preferences" component={Preferences} />
        <Stack.Screen name="Subscriptions" component={Subscriptions} />
        <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
    </Stack.Navigator>
  );
}

export default UserInfo;
