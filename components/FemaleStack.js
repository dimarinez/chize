/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import Matches from '../components/Matches';
import UserInfo from '../components/UserInfo';
import PostFeed from '../components/PostFeed';
import Post from '../components/Post';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

const FemaleStack = () => {
  const iconMappings = {
    UserInfo: 'account',
    Matches: 'human-male-female',
    Post: 'card-account-details-outline',
    PostFeed: 'fire',
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { backgroundColor: '#000000' },
          tabBarIcon: ({ focused }) => {
              const iconName = iconMappings[route.name];
              const iconColor = focused ? '#FFFFFF' : '#757780';
              return (
                  <Icon name={iconName} solid size={30} color={iconColor} />
              );
          },
      })}>
          <Tab.Screen name="UserInfo" component={UserInfo} />
          <Tab.Screen name="Matches" component={Matches} />
          <Tab.Screen name="Post" component={Post} />
          <Tab.Screen name="PostFeed" component={PostFeed} />
      </Tab.Navigator>
    </>
  );
}

export default FemaleStack;
