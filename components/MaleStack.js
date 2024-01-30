import React, {useContext} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Matches from '../components/Matches';
import UserInfo from '../components/UserInfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Requests from '../components/Requests';
import Post from '../components/Post';
import { Text } from 'react-native';
import UserContext from '../context/UserContext';
import PostFeed from '../components/PostFeed';

const Tab = createBottomTabNavigator();

const MaleStack = () => {
  const {
    user,
  } = useContext(UserContext);

  const iconMappings = {
    UserInfo: 'account',
    Matches: 'handshake-outline',
    Post: 'card-account-details-outline',
    PostFeed: 'hand-wave',
    Requests: 'email-fast',
  };

  const labelMappings = {
    UserInfo: 'Account',
    Matches: 'Matches',
    Post: 'Post',
    PostFeed: 'Feed',
    Requests: 'Requests',
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#000000', paddingTop: 5, },
          tabBarIcon: ({ focused }) => {
              const iconName = iconMappings[route.name];
              const iconColor = focused ? '#FFFFFF' : '#757780';
              return (
                  <Icon name={iconName} solid size={30} color={iconColor} />
              );
          },
          tabBarLabel: ({ focused }) => {
            const label = labelMappings[route.name];
            const labelColor = focused ? '#FFFFFF' : '#757780';
            return <Text style={{ color: labelColor, fontSize: 10 }}>{label}</Text>;
          },
      })}
      >
        <Tab.Screen name="UserInfo" component={UserInfo} />
        <Tab.Screen name="Matches" component={Matches} />
        <Tab.Screen name="Post" component={Post} />
        <Tab.Screen name="Requests" component={Requests} />
        {user?.preference === 'friends' || user?.preference === 'business' ? <Tab.Screen name="PostFeed" component={PostFeed} /> : null }
      </Tab.Navigator>
    </>
  );
};

export default MaleStack;
