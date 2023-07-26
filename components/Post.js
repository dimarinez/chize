/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import PostForm from '../components/PostForm';
import CameraComponent from '../components/CameraComponent';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const Post = () => {

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
