import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Map from './Map';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Purchases from 'react-native-purchases';

const ProfileDetails = ({ navigation }) => {
    const {
        user,
        setUser,
        setCurrPlaceId,
        currLocation,
        setActivePost,
        activePost,
    } = useContext(UserContext);

    const checkIfRowExists = async (deviceToken, subscriptionValue) => {
        try {
          // Send a select query to the Supabase table
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .filter('deviceToken', 'eq', deviceToken)
            .filter('subscriptionType', 'eq', subscriptionValue)
            .not('user_id', 'eq', user?.user_id);

          if (error) {
            console.error('Error fetching data:', error);
            return false; // Handle the error as needed
          }

          // If data exists, the row with the specified device_token and subscription value exists
          if (data && data.length > 0) {
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error('Error checking if row exists:', error);
          return false; // Handle the error as needed
        }
    };

    const performSubscriptionCheck = async () => {
        const customerInfo = await Purchases.getCustomerInfo();
        if (typeof customerInfo?.entitlements.active.chizepremium !== 'undefined') {
            try {
                const rowExists = await checkIfRowExists(user?.deviceToken, 'premium');
                // If the row exists, update user subscriptionType to 'premium'
                if (!rowExists) {
                    setUser({
                        ...user,
                        subscriptionType: 'premium',
                    });
                    await supabase
                        .from('profiles')
                        .update({
                            subscriptionType: 'premium',
                        })
                        .eq('user_id', user?.user_id)
                        .select();
                } else {
                    // If the row doesn't exist, update user subscriptionType to null
                    setUser({
                        ...user,
                        subscriptionType: null,
                    });
                    await supabase
                        .from('profiles')
                        .update({
                            subscriptionType: null,
                        })
                        .eq('user_id', user?.user_id)
                        .select();
                }
            } catch (error) {
                console.log('Error performing subscription check:', error);
            }
        }
    };

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            await performSubscriptionCheck();
        };
        const fetchUserActivePost = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('user_id', user.user_id)
                    .eq('active', true);

                if (error) {
                    return;
                }

                if (data) {
                    setActivePost(data[0]);
                    setCurrPlaceId(data[0]?.place_id);
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

              // Add the event handlers for push notifications
        const handlePushNotifications = () => {
            // Register the event listeners for push notifications
            PushNotificationIOS.addEventListener('register', onRegistered);
            PushNotificationIOS.addEventListener(
                'registrationError',
                onRegistrationError,
            );

            PushNotificationIOS.requestPermissions({
                alert: true,
                badge: true,
                sound: true,
                critical: true,
            }).then(
            (data) => {
                console.log('PushNotificationIOS.requestPermissions', data);
            },
            (data) => {
                console.log('PushNotificationIOS.requestPermissions failed', data);
            },
            );
        };

        handlePushNotifications();
        fetchUserActivePost();

        if (user?.name) {
            fetchSubscriptionData();
        }

        return () => {
            PushNotificationIOS.removeEventListener('register');
            PushNotificationIOS.removeEventListener('registrationError');
        };
    }, []);

        // Add the event handlers for push notifications
    const onRegistered = (deviceToken) => {
        console.log(deviceToken);
        const setDeviceToken = async () => {
            try {
              if (deviceToken) {
                const { error } = await supabase
                .from('profiles')
                .update({
                    deviceToken,
                })
                .eq('user_id', user.user_id)
                .select();

                if (error) {
                  console.log(error);
                }
              }
            } catch (e) {
              console.log(e);
            }
        };

        if (user?.user_id) {
            setDeviceToken();
        }
    };

    const onRegistrationError = (error) => {
        console.log('Failed To Register For Remote Push', error);
    };

    return (
        <View style={styles.container}>
            {(user && user?.details) &&
                <>
                    <View style={styles.detailContainer}>
                        <View style={styles.accountContainer}>
                            <Text style={styles.name}>{user?.name}</Text>{user?.subscriptionType ? <View style={styles.crown}><Icon name="crown-circle-outline" color={'gold'} size={26}/></View> : ''}
                            <TouchableOpacity
                                style={styles.pencil}
                                onPress={() => navigation.navigate('ProfileEdit')}
                            >
                                <Icon name="pencil-outline" size={26}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.settingContainer}>
                            <TouchableOpacity
                                style={styles.settings}
                                onPress={() => navigation.navigate('Settings')}
                            >
                                <Icon name="cog-outline" size={26}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.details}>{user?.details}</Text>
                    <View style={styles.interestsContainer}>
                        {user?.interests && user?.interests.map((interest) => (
                            <Text style={styles.interest} key={interest}>{interest}</Text>
                        ))}
                    </View>
                </>
            }
            {activePost && <Map activepost={activePost} />}
            {currLocation && !activePost && <Map activepost={activePost} />}
        </View>
    )
};

const styles = StyleSheet.create({
    accountContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    profileOptionsContainer: {
        marginBottom: 100,
    },
    placeName: {
        fontSize: 20,
    },
    activeName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 35,
        marginHorizontal: -5,
    },
    interest: {
        backgroundColor: '#eaeaea',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        margin: 5,
        overflow: 'hidden',
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
    crown: {
        paddingRight: 7,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        marginRight: 3,
        marginTop: '2%',
    },
    details: {
        fontSize: 16,
        marginBottom: 15,
    },
    gender: {
        fontSize: 16,
        marginBottom: 10,
    },
});

export default ProfileDetails;
