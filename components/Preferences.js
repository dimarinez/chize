import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Slider} from '@miblanchard/react-native-slider';
import UserContext from '../context/UserContext';
import {supabase} from '../supabase';
import Toast from 'react-native-toast-message';

const desiredTypesList = [
    'bar',
    'church',
    'cafe',
    'park',
    'restaurant',
    'gym',
    'library',
    'amusement_park',
    'night_club',
    'school',
    'campground',
];

const Preferences = ({navigation}) => {
    const [radiusValue, setRadiusValue] = useState(10);
    const [numberOfSuggestions, setNumberOfSuggestions] = useState(3);
    const [desiredTypes, setDesiredTypes] = useState([]);
    const isSubmitDisabled = desiredTypes?.length < 1;
    const {
        user,
        setUser,
        setLocationTypeChange,
    } = useContext(UserContext);

    const handleFormSubmit = async () => {
        // Use the age state here to perform the submission
        try {
            const parsedNumberOfSuggestions = parseFloat(numberOfSuggestions);
            const parsedRadiusValue = parseFloat(radiusValue);

            const {error} = await supabase
                .from('profiles')
                .update({
                    numberOfSuggestions: parsedNumberOfSuggestions,
                    radius: parsedRadiusValue,
                    locationTypes: desiredTypes,
                })
                .eq('user_id', user.user_id)
                .select();
            if (error) {
                console.log(error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message,
                });
            } else {
                setUser({
                    ...user,
                    numberOfSuggestions: parsedNumberOfSuggestions,
                    radius: parsedRadiusValue,
                    locationTypes: desiredTypes,
                });

                Toast.show({
                    type: 'success',
                    text1: 'Success!',
                    text2: 'Your post preferences have been updated',
                });

                navigation.navigate('ProfileDetails');
                setLocationTypeChange(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (user?.subscriptionType) {
            setNumberOfSuggestions(user.numberOfSuggestions);
            setRadiusValue(user.radius);
            if (!user.locationTypes) {
                setDesiredTypes(desiredTypesList);
            } else {
                setDesiredTypes(user.locationTypes);
            }
        }
    }, []);

    return (
        <View style={styles.page}>
            <View style={styles.backArrowContainer}>
                <TouchableOpacity
                    style={styles.backArrow}
                    onPress={() => {
                        navigation.navigate('Settings');
                    }}
                >
                    <Icon name="arrow-left" size={26}/>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Radius (m):</Text>
            <Slider
                    maximumValue={1000}
                    minimumValue={10}
                    step={10}
                    value={radiusValue}
                    onValueChange={val => setRadiusValue(val)}
                />
            <Text>{radiusValue}</Text>
            <Text style={styles.title}>Number of recommendations:</Text>
            <Slider
                    maximumValue={10}
                    minimumValue={1}
                    step={1}
                    value={numberOfSuggestions}
                    onValueChange={val => setNumberOfSuggestions(val)}
                />
            <Text>{numberOfSuggestions}</Text>
            <LocationPreferences desiredTypes={desiredTypes} setDesiredTypes={setDesiredTypes}/>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={handleFormSubmit} 
                style={[styles.button, isSubmitDisabled && styles.disabledButton]}
                disabled={isSubmitDisabled}>
                    <Text style={styles.buttonText}>Apply</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

function LocationPreferences({desiredTypes, setDesiredTypes}) {
    const handleTypePress = (type) => {
        if (desiredTypes.includes(type)) {
            setDesiredTypes(desiredTypes.filter((item) => item !== type));
        } else {
        // Hobby is not selected, add it to the array
            setDesiredTypes([...desiredTypes, type]);
        }
    };

    return (
        <View>
            <Text style={styles.title}>Choose location types:</Text>
            <View style={styles.typeButtonContainer}>
                {desiredTypesList && desiredTypesList.map((type) => (
                <TouchableOpacity
                    key={type}
                    style={[
                    styles.typeButton,
                    desiredTypes.includes(type) && styles.selectedButton,
                    ]}
                    onPress={() => handleTypePress(type)}
                >
                    <Text style={styles.typeButtonText}>{type.replace('_', ' ')}</Text>
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
    selectedButton: {
        backgroundColor: '#FF5A5F',
        color: '#FFFFFF',
    },
    typeButtonText: {
        color: '#000000',
        textTransform: 'capitalize',
    },
    typeButtonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
        marginBottom: 20,
    },
    typeButton: {
        backgroundColor: '#eaeaea',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        margin: 5,
    },
    page: {
        flex: 1,
        paddingTop: '15%',
        alignContent: 'center',
        paddingHorizontal: 20,
        position: 'relative',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#FF5A5F',
        borderRadius: 8,
        paddingVertical: 15,
        marginTop: 20,
        paddingHorizontal: 20,
        marginBottom: 35,
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: 0,
        right: 20,
        left: 20,
    },
    title: {
        fontSize: 18,
        marginTop: 20,
    },
});

export default Preferences;
