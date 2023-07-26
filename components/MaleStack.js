import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Matches from '../components/Matches';
import UserInfo from '../components/UserInfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Requests from '../components/Requests';
import Post from '../components/Post';

const Tab = createBottomTabNavigator();

const MaleStack = () => {
  const iconMappings = {
    UserInfo: 'account',
    Matches: 'human-male-female',
    Post: 'card-account-details-outline',
    Requests: 'hand-wave',
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
            }
        })}
      >
        <Tab.Screen name="UserInfo" component={UserInfo} />
        <Tab.Screen name="Matches" component={Matches} />
        <Tab.Screen name="Post" component={Post} />
        <Tab.Screen name="Requests" component={Requests} />
      </Tab.Navigator>
    </>
  );
};

export default MaleStack;
