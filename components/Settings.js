import React, { useContext, useState } from 'react';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import { REACT_NATIVE_API_DELETE_USER } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

const Settings = ({ navigation, route }) => {
    const { user, setUser, setCurrLocation, setCurrPlaceId, setImage, setActivePost, watchId, setWatchId } = useContext(UserContext);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [displayLoader, setDisplayLoader] = useState(false);

    return (
        <View style={styles.settingsContainer}>
        <View style={styles.backArrowContainer}>
            <TouchableOpacity
                style={styles.backArrow}
                onPress={() => {
                    navigation.navigate('ProfileDetails');
                }}
            >
                <Icon name="arrow-left" size={26}/>
            </TouchableOpacity>
        </View>
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.profileOptionsContainer}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Preferences');
                    }}
                    style={[
                        styles.pillButton,
                        !user?.subscriptionType && styles.disabledButton,
                    ]}
                    disabled={!user?.subscriptionType}
                >
                    <View style={styles.settingsOption}>
                        <Icon name="tune-vertical" size={28} color={'#CCCCCC'}/>
                        <Text style={styles.buttonTextOption}>Preferences</Text>
                    </View>
                    <Icon name="chevron-right" size={26}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.pillButton}
                    onPress={() => {
                        setPrivacyModalVisible(true);
                    }}
                >
                    <View style={styles.settingsOption}>
                        <Icon name="text-box-outline" size={28} color={'#CCCCCC'}/>
                        <Text style={styles.buttonTextOption}>Privacy Policy</Text>
                    </View>
                    <Icon name="chevron-right" size={26}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.pillButton}
                    onPress={() => {
                        navigation.navigate('Subscriptions');
                    }}
                >
                    <View style={styles.settingsOption}>
                        <Icon name="crown-circle-outline" size={28} color={'#CCCCCC'}/>
                        <Text style={styles.buttonTextOption}>Subscriptions</Text>
                    </View>
                    <Icon name="chevron-right" size={26}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.signOut}
                    onPress={async () => {
                        await supabase.auth.signOut();
                        setWatchId(null);
                        setUser(null);
                        setImage(null);
                        setCurrLocation(null);
                        setCurrPlaceId(null);
                        setActivePost(null);
                        Geolocation.clearWatch(watchId);
                    }}
                >
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                    style={styles.delete}
                    onPress={async () => {
                        try {
                            setDisplayLoader(true);
                            if (supabase && supabase.auth.getSession()) {
                                // Clear tokens from AsyncStorage
                                await AsyncStorage.multiRemove(['supabase-token', 'supabase-reftoken']);
                                try {
                                    // Delete user data from Supabase
                                    const { error } = await supabase.from('profiles').delete().eq('user_id', user.user_id);
                                    if (!error) {
                                        axios.delete(REACT_NATIVE_API_DELETE_USER, {
                                            headers: { 'Content-Type': 'application/json' },
                                            data: { user_id: user.user_id },
                                        })
                                        .then(response => {
                                            setDisplayLoader(false);
                                            supabase.auth.signOut();
                                            setWatchId(null);
                                            setUser(null);
                                            setCurrLocation(null);
                                            setCurrPlaceId(null);
                                            setActivePost(null);
                                            Geolocation.clearWatch(watchId);
                                        })
                                        .catch(e => {
                                            setDisplayLoader(false);
                                            console.error(e.response ? e.response.data : e.message); // Handle error
                                        });
                                    }
                                } catch (e) {
                                    console.error('An error occurred:', e.message);
                                }
                            }
                        } catch (error) {
                            console.error('Error signing out:', error);
                        }
                    }}
                >
                    <Text style={styles.buttonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

      <Modal visible={privacyModalVisible} animationType="slide">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.close} onPress={() => {
                        setPrivacyModalVisible(false);
                    }} >
                        <Icon name="window-close" size={28} color="#000000" />
                    </TouchableOpacity>
                    <View style={styles.termsConditions}>
  <Text style={styles.heading}>Privacy Policy for Chize</Text>
  <Text style={styles.updatedDate}>Last Updated: January 31, 2024</Text>

  <Text style={styles.sectionHeading}>1. Introduction</Text>
  <Text style={styles.paragraph}>
    Welcome to Chize ("we," "our," or "us"). We are committed to protecting
    your privacy and your data. This Privacy Policy is designed to help you
    understand how we collect, use, disclose, and safeguard your personal
    information.
  </Text>

  <Text style={styles.sectionHeading}>2. How We Use Your Information</Text>
  <Text style={styles.paragraph}>
    We use the information we collect to provide dating services, improve our services, and communicate with you. This includes matching users based on preferences and location, facilitating communication between users, personalizing the app experience, analyzing app usage to enhance features, and sending updates and service-related information.
  </Text>

  <Text style={styles.sectionHeading}>3. Your Choices</Text>
  <Text style={styles.paragraph}>
    You have choices regarding your account settings, communication preferences, and can delete your account at any time to remove your profile and associated data from our app.
  </Text>

  <Text style={styles.sectionHeading}>4. Security</Text>
  <Text style={styles.paragraph}>
    We implement security measures to protect your information, though no data transmission over the internet can be guaranteed to be entirely secure.
  </Text>

  <Text style={styles.sectionHeading}>5. Changes to this Privacy Policy</Text>
  <Text style={styles.paragraph}>
    We may update this Privacy Policy for operational, legal, or regulatory reasons. Changes will be notified through our website or the app.
  </Text>

  <Text style={styles.sectionHeading}>6. User Interactions and Meetups in Chize App</Text>
  <Text style={styles.paragraph}>
    We do not monitor or moderate meetings or interactions outside of our app. Users are responsible for their safety when deciding to meet in person. We encourage caution and good judgment. We are not liable for any incidents or damages from such meetings.
  </Text>

  <Text style={styles.sectionHeading}>7. Contact Us</Text>
  <Text style={styles.paragraph}>
    If you have questions or concerns about this Privacy Policy or our data practices, please contact us at feedback@chizeapp.com.
  </Text>
</View>

                </View>
                </ScrollView>
            </Modal>
            {displayLoader && 
                <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF5A5F" />
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        opacity: 0.6,
      },
    close: {
        position: 'absolute',
        right: 20,
        top:60,
        zIndex: 1,
    },
    termsConditions: {
      paddingTop: 40,
    },
      modalContainer: {
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    disabledButton: {
        opacity: 0.3,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
      },
      updatedDate: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 24,
      },
      sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
      },
      subsectionHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
      },
      paragraph: {
        fontSize: 14,
        marginBottom: 12,
      },
      listItem: {
        fontSize: 14,
        marginLeft: 16,
      },
    buttonTextOption: {
        marginLeft: 10,
        fontSize: 18,
    },
    settingsOption: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 25,
        marginBottom: 20,
    },
    delete: {
        position: 'absolute',
        bottom: 30,
    },
    buttonText: {
        textAlign: 'center',
    },
    signOut: {
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 15,
        marginHorizontal: 20,
        marginTop: 50,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    settingsContainer: {
        flex: 1,
    },
    backArrowContainer: {
        zIndex: 1,
        paddingTop: '15%',
        paddingHorizontal: 20,
    },
    container: {
        flex: 1,
        paddingTop: '5%',
        alignItems: 'center',
    },
    profileOptionsContainer: {
        flexDirection: 'column', // Align items vertically
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    pillButton: {
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
});

export default Settings;
