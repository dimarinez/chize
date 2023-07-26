import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';
import UserContext from '../context/UserContext';

const ProfileEdit = () => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [interests, setInterests] = useState([]);
    const navigation = useNavigation();
    const {user, setUser, setCurrLocation, setCurrPlaceId, currLocation, setActivePost} = useContext(UserContext);
    const isSubmitDisabled = interests?.length < 3 || !details || !name;

    const handleSetName = text => {
        setName(text);
    }

    const handleSetDetails = text => {
        setDetails(text);
    }

    const handleProfileSubmit = async () => {
        try {
            const { error } = await supabase
            .from('profiles')
            .update({
                name,
                details,
                interests,
            })
            .eq('user_id', user.user_id)
            .select();

            if (error) {
                console.error(error);
                return;
            } else {
                setUser({
                    ...user,
                    name,
                    details,
                    interests,
                });
            }
        } catch (e) {
            console.log(e);
        }

        navigation.navigate('ProfileDetails');
    };

    useEffect(() => {
        if (user?.name) {
            setName(user?.name);
            setDetails(user?.details);
            setInterests(user?.interests || []);
        }
    }, [user, currLocation]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
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
                        onChangeText={handleSetDetails}
                    />
                </View>
                <Interests interests={interests} setInterests={setInterests}/>
                <TouchableOpacity onPress={handleProfileSubmit} 
                    style={[styles.profileSubmit, isSubmitDisabled && styles.disabledButton]}
                    disabled={isSubmitDisabled}>
                    <Text style={styles.profileSubmitText}>update</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
};

function Interests({interests, setInterests}) {
    const hobbiesList = [
        'Gym',
        'Sports',
        'Books',
        'Music',
        'Art',
        'Cooking',
        'Travel',
        'Photography',
        'Christianity',
        'Gardening',
    ];

    const handleHobbyPress = (hobby) => {
        if (interests.includes(hobby)) {
        // Hobby is already selected, remove it from the array
            setInterests(interests.filter((item) => item !== hobby));
        } else {
        // Hobby is not selected, add it to the array
            if (interests.length < 5) {
                setInterests([...interests, hobby]);
            }
        }
    };

    return (
        <View>
            <Text style={styles.label}>Select interests (up to 5):</Text>
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
    disabledButton: {
        opacity: 0.3,
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
        paddingVertical: 10,
        marginTop: 20,
        paddingHorizontal: 20,
        marginBottom: 5,
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
