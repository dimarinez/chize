/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import PostForm from '../components/PostForm';
import CameraComponent from '../components/CameraComponent';
import { createStackNavigator } from '@react-navigation/stack';
import navigateToScreen from '../PushNotification';

const Stack = createStackNavigator();

const Post = ({navigation}) => {
  useEffect(()=> {
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
        <Stack.Screen name="PostForm" component={PostForm} />
        <Stack.Screen name="CameraComponent" component={CameraComponent} />
    </Stack.Navigator>
  );
}

export default Post;
