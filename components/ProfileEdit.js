import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, ScrollView, Alert, KeyboardAvoidingView, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';
import UserContext from '../context/UserContext';
import navigateToScreen from '../PushNotification';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

const ProfileEdit = () => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [interests, setInterests] = useState([]);
    const [preference, setPreference] = useState('');
    const navigation = useNavigation();
    const {
        user,
        setUser,
        setCurrPlaceId,
        currLocation,
        setActivePost,
        activePost,
        currPlaceId,
        setImage,
        setLocationDescription,
      } = useContext(UserContext);
    const isSubmitDisabled = interests?.length < 3 || !details || !name;

    const handleSetName = text => {
        setName(text);
    }

    const handleSetDetails = text => {
        setDetails(text);
    }

    const handleProfileSubmit = async () => {
        try {
            if (activePost && preference !== user.preference) {
                Alert.alert(
                    'Confirm Deletion',
                    'Updating your preference will remove your current post. Are you sure?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await supabase
                              .from('matches')
                              .delete()
                              .or(`user1_id.eq.${user.user_id},user2_id.eq.${user.user_id}`)
                              .eq('place_id', currPlaceId);

                            await supabase
                              .from('requests')
                              .delete()
                              .or(
                                `sender_id.eq.${user.user_id},receiver_id.eq.${user.user_id}`,
                              )
                              .eq('place_id', currPlaceId);

                            const {error: postError} = await supabase
                              .from('posts')
                              .update({
                                active: false,
                              })
                              .eq('user_id', user.user_id);

                            if (postError) {
                              console.log(postError);
                              return;
                            }

                            setImage(null);
                            setLocationDescription('');
                            setActivePost(null);
                            setCurrPlaceId(null);

                            const {error: emptyError} = await supabase.storage.emptyBucket(
                              user.user_id,
                            );

                            if (emptyError) {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: emptyError,
                                });
                            } else {
                                const { error } = await supabase
                                .from('profiles')
                                .update({
                                    name,
                                    details,
                                    interests,
                                    preference,
                                })
                                .eq('user_id', user.user_id)
                                .select();

                                if (error) {
                                    console.error(error);
                                    return;
                                } else {
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Success!',
                                        text2: 'Your profile was successfully updated.',
                                    });
                                    setUser({
                                        ...user,
                                        name,
                                        details,
                                        interests,
                                        preference,
                                    });
                                }
                                navigation.navigate('ProfileDetails');
                            }
                          } catch (e) {
                            console.log(e.message);
                          }
                        },
                      },
                    ],
                    {cancelable: true},
                );
            } else {
                const { error } = await supabase
                .from('profiles')
                .update({
                    name,
                    details,
                    interests,
                    preference,
                })
                .eq('user_id', user.user_id)
                .select();

                if (error) {
                    console.error(error);
                    return;
                } else {
                    Toast.show({
                        type: 'success',
                        text1: 'Success!',
                        text2: 'Your profile was successfully updated.',
                    });
                    setUser({
                        ...user,
                        name,
                        details,
                        interests,
                        preference,
                    });
                }
                navigation.navigate('ProfileDetails');
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        navigateToScreen().then(screenName => {
            if (screenName) {
              navigation.navigate(screenName);
            }
        });

        if (user?.name) {
            setName(user?.name);
            setDetails(user?.details);
            setInterests(user?.interests || []);
            setPreference(user?.preference || 'friends');
        }
    }, [user, currLocation]);

    return (
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backArrow}
                    onPress={() => {
                        navigation.navigate('ProfileDetails');
                    }}
                >
                    <Icon name="arrow-left" size={26}/>
                </TouchableOpacity>
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Display Name:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={name}
                            onChangeText={handleSetName}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Enter Details:</Text>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            placeholder="Enter details here"
                            value={details}
                            maxLength={350}
                            onChangeText={handleSetDetails}
                        />
                    </View>
                    <Preference preference={preference} setPreference={setPreference} />
                    <Interests interests={interests} setInterests={setInterests}/>
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
        <View style={styles.floatButtonContainer}>
            <TouchableOpacity onPress={handleProfileSubmit} 
                style={[styles.profileSubmit, isSubmitDisabled && styles.disabledButton]}
                disabled={isSubmitDisabled}>
                <Text style={styles.profileSubmitText}>update</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    );
};

function Preference({ setPreference, preference }) {
    return (
        <View>
            <Text style={styles.label}>What are you looking for?</Text>
            <View style={styles.hobbyButtonContainer}>
            <TouchableOpacity
                    style={[styles.hobbyButton, preference === 'friends' && styles.selectedButton]}
                    onPress={() => setPreference('friends')}
                >
                    <Text style={[styles.hobbyButtonText, preference === 'friends' && styles.activeButtonText]}>
                       Friends
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.hobbyButton, preference === 'date' && styles.selectedButton]}
                    onPress={() => setPreference('date')}
                >
                    <Text style={[styles.hobbyButtonText, preference === 'date' && styles.activeButtonText]}>
                        Date
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.hobbyButton, preference === 'business' && styles.selectedButton]}
                    onPress={() => setPreference('business')}
                >
                    <Text style={[styles.hobbyButtonText, preference === 'business' && styles.activeButtonText]}>
                    Business
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function Interests({interests, setInterests}) {
    const hobbiesList = [
        'Gym',
        'Sports',
        'Books',
        'Music',
        'Christianity',
        'Traveling',
        'Cooking',
        'Hiking',
        'Yoga',
        'Movies',
        'Gaming',
        'Art',
        'Wine tasting',
        'Veganism',
        'Photography',
        'Meditation',
        'Theatre',
        'Dancing',
        'Podcasts',
        'Beach',
        'Gardening',
        'Volunteering',
        'Spirituality',
        'Pets/Animals',
        'Fashion',
        'DIY Projects',
        'Biking',
        'Rock climbing',
        'Surfing',
        'Camping',
        'Concerts',
        'Jazz',
        'Craft beer',
        'Horseback riding',
        'Scuba diving',
        'Vegan/vegetarian',
        'Songwriting',
        'Writing',
        'Astronomy',
        'Fishing',
        'Kayaking',
        'Vintage',
        'Tattoos',
        'Jazz bars',
        'Tea/Coffee enthusiast',
        'Thrift shopping',
        'Snowboarding/skiing',
        'Stand-up comedy',
        'Tech/Startups',
        'Cultural festivals',
    ];

    const handleHobbyPress = (hobby) => {
        if (interests.includes(hobby)) {
        // Hobby is already selected, remove it from the array
            setInterests(interests.filter((item) => item !== hobby));
        } else {
        // Hobby is not selected, add it to the array
            if (interests.length < 6) {
                setInterests([...interests, hobby]);
            }
        }
    };

    return (
        <View>
            <Text style={styles.label}>Select interests (up to 6):</Text>
            <View style={styles.hobbyButtonContainer}>
                {hobbiesList && hobbiesList.map((hobby) => (
                <TouchableOpacity
                    key={hobby}
                    style={[
                    styles.hobbyButton,
                    interests.includes(hobby) && styles.selectedButton,
                    ]}
                    onPress={() => handleHobbyPress(hobby)}
                >
                    <Text style={styles.hobbyButtonText}>{hobby}</Text>
                </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    floatButtonContainer: {
        padding: 20
    },
    disabledButton: {
        opacity: 0.3,
    },
    backArrow: {
        marginBottom: 20,
    },
    profileSubmitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    profileSubmit: {
        backgroundColor: '#FF5A5F',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    hobbyButtonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    hobbyButton: {
        backgroundColor: '#eaeaea',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        margin: 5,
    },
    selectedButton: {
        backgroundColor: '#FF5A5F',
        color: '#FFFFFF',
    },
    hobbyButtonText: {
        color: '#000000',
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: '15%',
        paddingBottom: 20,
    },
    formSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    picker: {
        margin: 0,
        padding: 0,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        height: 100,
    },
});

export default ProfileEdit;
