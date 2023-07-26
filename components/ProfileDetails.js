import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { REACT_NATIVE_GOOGLE_PLACE } from '@env';
import axios from 'axios';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileDetails = ({ navigation }) => {
    const {user, setUser, setCurrLocation, setCurrPlaceId, currLocation, setActivePost, activePost, pushNotificationToken} = useContext(UserContext);
    const [suggestedPlaces, setSuggestedPlaces] = useState([]);

    const fetchRecordsByPlaceId = async (placeIds) => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select()
                .in('place_id', placeIds)
                .limit(1); // Add .limit(1) to select only one record

            if (error) {
                return [];
            }

            return data;
        } catch (error) {
            return [];
        }
    };

    const getPlaceIds = async (latitude, longitude, radius) => {
        try {
          const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            {
              params: {
                location: `${latitude},${longitude}`,
                radius,
                key: REACT_NATIVE_GOOGLE_PLACE,
                keyword: 'coffee shops',
              },
            }
          );

          if (response.data.results) {
            const placeIds = response.data.results.map((result) => result.place_id);
            return placeIds;
          }
        } catch (error) {
          console.log('Error getting place IDs:', error);
          return [];
        }

        return [];
    };

    useEffect(() => {
        const fetchSuggestedPlaces = async () => {
          if (currLocation?.coords) {
            try {
              const googlePlaceIds = await getPlaceIds(
                currLocation.coords.latitude,
                currLocation.coords.longitude,
                500
              );

              const matchedRecords = await fetchRecordsByPlaceId(googlePlaceIds);
              setSuggestedPlaces(matchedRecords);
            } catch (error) {
              setSuggestedPlaces([]);
            }
          }
        };

        const fetchUserActivePost = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('user_id', user.user_id);

                if (error) {
                    return;
                }

                if (data) {
                    setActivePost(data[0]);
                    setCurrPlaceId(data[0].place_id);
                }
            } catch (error) {
                console.log(error);
                return [];
            }
        };

        supabase.channel('active-posts')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'posts' },
            (payload) => {
                fetchUserActivePost();
            }
        )
        .subscribe();
        fetchUserActivePost();
        fetchSuggestedPlaces();
    }, [currLocation?.coords]);

    return (
        <View style={styles.container}>
            {user?.name &&
                <>
                    <View style={styles.detailContainer}>
                        <Icon name="account" size={26}/><Text style={styles.name}>{user?.name}</Text>
                    </View>
                    <Text style={styles.details}>{user?.details}</Text>
                    <Text style={styles.gender}>{user?.gender}</Text>
                    <View style={styles.interestsContainer}>
                        {user?.interests && user?.interests.map((interest) => (
                            <Text style={styles.interest} key={interest}>{interest}</Text>
                        ))}
                    </View>
                </>
            }
            {activePost &&
                <>
                    <Text style={styles.activeName}>Active Post</Text>
                    <Text style={styles.placeName}>{activePost.location}</Text>
                </>
            }

            <View style={styles.profileOptionsContainer}>
            <TouchableOpacity onPress={
                () => {
                    navigation.navigate('ProfileEdit');
                }
            } title="Edit Profile">
                <Text style={styles.editProfiles}>
                    Edit Profile
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => {
                try {
                    if (supabase && supabase.auth.getSession()) {
                        await AsyncStorage.removeItem('supabase-token');
                        await AsyncStorage.removeItem('supabase-reftoken');
                        await supabase.auth.signOut();
                        setUser(null);
                        setCurrLocation(null);
                        setCurrPlaceId(null);
                        setActivePost(null);
                    }
                } catch (error) {
                    console.error('Error signing out:', error);
                }
            }
            }>
                <Text style={styles.signOut}>Sign Out</Text>
            </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    placeName: {
        fontSize: 20,
        marginBottom: 50,
    },
    activeName: {
        fontSize: 24,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    detailContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 50,
        marginHorizontal: -5,
    },
    interest: {
        backgroundColor: '#eaeaea',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        margin: 5,
    },
    editProfiles: {
        textAlign: 'center',
    },
    signOut: {
        marginTop: 15,
        textAlign: 'center',
    },
    activePlaces: {
        marginBottom: 20,
    },
    container: {
        flex: 1,
        color: '#757780',
        paddingHorizontal: 20,
        paddingTop: '15%',
        backgroundColor: '#ffffff',
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 3,
        marginTop: '2%',
    },
    details: {
        fontSize: 16,
        marginBottom: 10,
    },
    gender: {
        fontSize: 16,
        marginBottom: 10,
    },
});

export default ProfileDetails;
