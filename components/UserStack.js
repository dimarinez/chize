/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useContext, useEffect, useState} from 'react';
import FemaleStack from './FemaleStack';
import MaleStack from './MaleStack';
import {Linking, Platform, PermissionsAndroid, Alert, ToastAndroid} from 'react-native';
import UserContext from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import Geolocation from 'react-native-geolocation-service';

const UserStack = ({ session }) => {
  const { setUser, setCurrLocation, user, setWatchId, currLocation } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = (lat1 * Math.PI) / 180; // Convert latitude to radians
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//     const a =
//       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     const distance = R * c;
//     return distance;
// };

// const removeActivePost = async () => { 
//   try {
//     await supabase
//         .from('matches')
//         .delete()
//         .or(`user1_id.eq.${user.user_id},user2_id.eq.${user.user_id}`)
//         .eq('place_id', currPlaceId);

//     await supabase
//         .from('requests')
//         .delete()
//         .or(`sender_id.eq.${user.user_id},receiver_id.eq.${user.user_id}`)
//         .eq('place_id', currPlaceId);

//     const { error: postError } = await supabase
//         .from('posts')
//         .delete()
//         .eq('user_id', user.user_id)
//         .eq('active', true);

//     if (postError) {
//       console.log(postError);
//       return;
//     }

//     setImage(null);
//     setLocationDescription('');
//     setActivePost(null);
//     setCurrPlaceId(null);

//     const { error: emptyError } = await supabase
//       .storage
//       .emptyBucket(user.user_id);

//     if (emptyError) {
//       console.log(emptyError);
//     }
//   } catch (e) {
//     console.log(e.message);
//   }
// };

// const handleLocationCheck = async (position) => {
//     const distanceInMeters = calculateDistance(
//         position.coords.latitude,
//         position.coords.longitude,
//         activePost.coords.lat,
//         activePost.coords.lng
//     );

//     console.log(distanceInMeters);
//     // Now you can check if the distance is greater than 10 meters and delete the post if needed
//     if (distanceInMeters > 100) {
//         await removeActivePost();
//     } else {
//         return true;
//     }
// }

const getLocation = async () => {
  if (currLocation) {
      // Location already exists, no need to fetch it again
      return;
  }

  const hasPermission = await hasLocationPermission();

  if (!hasPermission) {
      return;
  }

  const watchId = Geolocation.watchPosition(
      position => {
          setCurrLocation(position);
          // if (activePost) {
          //   handleLocationCheck(position);
          // }
      },
      error => {
          Alert.alert(`Code ${error.code}`, error.message);
          console.log(error);
      },
      {
          enableHighAccuracy: true,
          distanceFilter: 10, // Update location if the user moves 10 meters
      },
  );
  setWatchId(watchId);
};

  const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const hasPermission = await hasPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
    }

    return false;
  };

  const hasPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert('Unable to open settings');
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      Alert.alert('Location permission denied');
    }

    if (status === 'disabled') {
      Alert.alert(
        `Turn on Location Services to allow Chise to determine your location.`,
        '',
        [
          { text: 'Go to Settings', onPress: openSetting },
          { text: "Don't Use Location", onPress: () => {} },
        ],
      );
    }

    return false;
};

useEffect(() => {
  const fetchUser = async () => {
    try {
      if (session) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id);

        if (profiles && profiles[0] && profiles[0]?.name) {
          setUser(profiles[0]);
        } else {
          navigation.navigate('SignUpSlider');
          setUser(session.user);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false); // Set loading state to false after fetching user
    }
  };

  const fetchLocation = async () => {
    await getLocation();
  };

  fetchLocation();

  fetchUser();
}, [session, setUser, navigation]);

if (isLoading) {
  // Render loading state or a placeholder if needed
  return null;
}

  return (
    <>
      {user?.gender === 'female' ? <FemaleStack /> : <MaleStack />}
    </>
  );
}

export default UserStack;
