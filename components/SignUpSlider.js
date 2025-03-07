import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Platform, TextInput, KeyboardAvoidingView, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define the form slides
const slides = [
    { id: '1', label: 'Slide 1', component: Slide1 },
    { id: '2', label: 'Slide 2', component: Slide2 },
    { id: '3', label: 'Slide 3', component: Slide3 },
    { id: '4', label: 'Slide 4', component: Slide4 },
    { id: '5', label: 'Slide 5', component: Slide5 },
    { id: '6', label: 'Slide 6', component: Slide6 },
    { id: '7', label: 'Slide 7', component: Slide7 },
    { id: '8', label: 'Slide 8', component: Slide8 },
];

const validateInputs = (value) => {
    let str = value.trim();

    if (!str) {
        return true;
    }

    return false;
};

// Slide 1 component
function Slide1({ setName, name, setNextState }) {
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        setIsEmpty(validateInputs(name));
        setNextState(isEmpty);
    });

    const handleNameChange = (text) => {
        setName(text);
        setIsEmpty(validateInputs(text));
        setNextState(isEmpty);
    };

    return (
        <View>
            <Text style={styles.title}>What is your name?</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={handleNameChange}
            />
        </View>
    );
}

function Slide2({ setGender, gender, setNextState }) {

    useEffect(() => {
        setNextState(false);
    });
    return (
        <View>
            <Text style={styles.title}>What gender are you?</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, gender === 'male' && styles.activeButton]}
                    onPress={() => setGender('male')}
                >
                    <Text style={[styles.buttonText, gender === 'male' && styles.activeButtonText]}>
                        Male
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, gender === 'female' && styles.activeButton]}
                    onPress={() => setGender('female')}
                >
                    <Text style={[styles.buttonText, gender === 'female' && styles.activeButtonText]}>
                        Female
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function Slide3({ setPreference, preference, setNextState }) {

    useEffect(() => {
        setNextState(false);
    });
    return (
        <View>
            <Text style={styles.title}>What are you looking for?</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, preference === 'friends' && styles.activeButton]}
                    onPress={() => setPreference('friends')}
                >
                    <Text style={[styles.buttonText, preference === 'friends' && styles.activeButtonText]}>
                        Friends
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, preference === 'date' && styles.activeButton]}
                    onPress={() => setPreference('date')}
                >
                    <Text style={[styles.buttonText, preference === 'date' && styles.activeButtonText]}>
                        Date
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, preference === 'business' && styles.activeButton]}
                    onPress={() => setPreference('business')}
                >
                    <Text style={[styles.buttonText, preference === 'business' && styles.activeButtonText]}>
                        Business
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


// Slide 3 component
function Slide4({ setDetails, details, setNextState }) {
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        setIsEmpty(validateInputs(details));
        setNextState(isEmpty);
    });
    const handleSetDetails = (text) => {
        setDetails(text);
        setIsEmpty(validateInputs(text));
        setNextState(isEmpty);
    };
    return (
        <View>
            <Text style={styles.title}>A little about yourself</Text>
            <TextInput
                style={styles.input}
                value={details}
                multiline
                maxLength={350}
                placeholder="Enter details here"
                onChangeText={handleSetDetails}
            />
        </View>
    );
}

// Slide 3 component
function Slide5({ setHometown, hometown, setNextState }) {
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        setIsEmpty(validateInputs(hometown));
        setNextState(isEmpty);
    });
    const handleSetHometown = (text) => {
        setHometown(text);
        setIsEmpty(validateInputs(text));
        setNextState(isEmpty);
    };
    return (
        <View>
            <Text style={styles.title}>Where is your hometown?</Text>
            <TextInput
                style={styles.input}
                value={hometown}
                onChangeText={handleSetHometown}
            />
        </View>
    );
}

function Slide6({ setAge, age, selectedDate, setSelectedDate, setNextState }) {
    useEffect(() => {
        setNextState(false)
        calculateAge(selectedDate);
    }, [selectedDate]);

    const calculateAge = (date) => {
        const currentDate = new Date();
        const selectedYear = date.getFullYear();
        const selectedMonth = date.getMonth();
        const selectedDay = date.getDate();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();

        // Calculate the difference in years
        let calculatedAge = currentYear - selectedYear;

        if (
            currentMonth < selectedMonth ||
            (currentMonth === selectedMonth && currentDay < selectedDay)
        ) {
            calculatedAge = calculatedAge - 1;
        }

        setAge(calculatedAge);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        calculateAge(date);
    };

    return (
        <View>
            <Text style={styles.title}>What's your age?</Text>
            <View style={styles.datePickerContainer}>
                <DatePicker
                    date={selectedDate}
                    onDateChange={handleDateChange}
                    mode="date"
                    androidVariant="nativeAndroid"
                    textColor="#000000"
                    fadeToColor="#FFFFFF"
                    style={styles.datePicker}
                />
            </View>
            <Text style={styles.ageLabel}>Age {age}</Text>
        </View>
    );
}

// Slide 5 component
function Slide7({ setHeight, feet, setFeet, inches, setInches, setNextState }) {
    useEffect(() => {
        setNextState(false);
    });

    // Generate an array of feet options from 1 to 9
    const feetOptions = Array.from({ length: 9 }, (_, index) => index + 1);

    // Generate an array of inches options from 0 to 11
    const inchesOptions = Array.from({ length: 12 }, (_, index) => index);

    const handleFeetChange = (selectedFeet) => {
        setFeet(selectedFeet);
    };

    const handleInchesChange = (selectedInches) => {
        setInches(selectedInches);
    };

    useEffect(() => {
        setHeight(`${feet}' ${inches}"`);
    }, [feet, inches, setHeight]);

    return (
        <View>
            <Text style={styles.title}>How tall are you?</Text>
            <View style={[styles.pickerContainer, styles.heightPicker ]}>
                <View style={styles.pickerItem}>
                    <Picker
                        selectedValue={feet}
                        onValueChange={handleFeetChange}
                        style={styles.picker}
                    >
                        {feetOptions.map((option) => (
                            <Picker.Item key={option} label={`${option}'`} value={option.toString()} />
                        ))}
                    </Picker>
                </View>
                <View style={styles.pickerItem}>
                    <Picker
                        selectedValue={inches}
                        onValueChange={handleInchesChange}
                        style={styles.picker}
                    >
                        {inchesOptions.map((option) => (
                            <Picker.Item key={option} label={`${option}"`} value={option.toString()} />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>
    );
}

function Slide8({ setSelectedHobbies, selectedHobbies, setNextState }) {
    useEffect(() => {
        setNextState(false);
    });

    const hobbiesList = [
        'Gym',
        'Sports',
        'Books',
        'Music',
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
        if (selectedHobbies.includes(hobby)) {
        // Hobby is already selected, remove it from the array
            setSelectedHobbies(selectedHobbies.filter((item) => item !== hobby));
        } else {
        // Hobby is not selected, add it to the array
            if (selectedHobbies.length < 6) {
                setSelectedHobbies([...selectedHobbies, hobby]);
            }
        }
    };

    return (
        <View>
            <Text style={styles.title}>Select your interests (up to 6)</Text>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollbox} keyboardShouldPersistTaps="handled">
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.hobbyButtonContainer}>
                {hobbiesList.map((hobby) => (
                <TouchableOpacity
                    key={hobby}
                    style={[
                    styles.hobbyButton,
                    selectedHobbies.includes(hobby) && styles.selectedButton,
                    ]}
                    onPress={() => handleHobbyPress(hobby)}
                >
                    <Text style={styles.hobbyButtonText}>{hobby}</Text>
                </TouchableOpacity>
                ))}
            </View>
            </TouchableWithoutFeedback>
            </ScrollView>
        </View>
    );
}

// FormSlides component
function FormSlides() {
    const navigation = useNavigation();
    const { setUser, user } = useContext(UserContext);
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
    const [name, setName] = useState('');
    const [gender, setGender] = useState('male');
    const [details, setDetails] = useState('');
    const [feet, setFeet] = useState("1'");
    const [inches, setInches] = useState('0"');
    const [age, setAge] = useState(null);
    const [height, setHeight] = useState('');
    const [preference, setPreference] = useState('friends');
    const [hometown, setHometown] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date('2005-01-01'));
    const [selectedHobbies, setSelectedHobbies] = useState([]);

    const setNextState = (isEmpty) => {
        setIsNextButtonDisabled(isEmpty);
    };

    const handleFormSubmit = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    name,
                    gender,
                    details,
                    age,
                    height,
                    hometown,
                    preference,
                    interests: selectedHobbies,
                })
                .eq('user_id', user?.user_id || user?.identities[0]?.user_id)
                .select();
            if (error) {
                console.error(error);
            } else {
                if (data) {
                    setUser(data[0]);
                }
                navigation.navigate('UserStack');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Function to navigate to the next slide
    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    // Function to navigate to the previous slide
    const previousSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    // Get the current slide component
    const CurrentSlideComponent = slides[currentSlide].component;

    return (
        <View style={styles.view}>
            {currentSlide > 0 && (
                <View style={styles.arrowLeftContainer}>
                    <TouchableOpacity title="Previous" onPress={previousSlide} style={styles.arrowLeft}>
                        <Icon name="arrow-left" size={20} color="black"/>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.slidesContainer}>
                <ProgressBar currentSlide={currentSlide} />
                <CurrentSlideComponent
                    name={name}
                    setName={setName}
                    gender={gender}
                    setGender={setGender}
                    details={details}
                    setDetails={setDetails}
                    age={age}
                    setAge={setAge}
                    height={height}
                    setHeight={setHeight}
                    hometown={hometown}
                    setHometown={setHometown}
                    preference={preference}
                    setPreference={setPreference}
                    setNextState={setNextState}
                    setSelectedHobbies={setSelectedHobbies}
                    selectedHobbies={selectedHobbies}
                    setFeet={setFeet}
                    feet={feet}
                    setInches={setInches}
                    inches={inches}
                    setSelectedDate={setSelectedDate}
                    selectedDate={selectedDate}
                />
            </View>
            <View style={styles.buttonsContainer}>
                    {currentSlide < slides.length - 1 && (
                        <TouchableOpacity
                            onPress={nextSlide}
                            style={[styles.navigationButton, isNextButtonDisabled && styles.disabledNavigationButton]}
                            disabled={isNextButtonDisabled}>
                            <Text style={styles.navigationButtonText}>Next</Text>
                        </TouchableOpacity>
                    )}
                    {currentSlide === slides.length - 1 && (
                        <TouchableOpacity onPress={handleFormSubmit} disabled={selectedHobbies.length < 4} style={[styles.navigationButton, selectedHobbies.length < 4 && styles.disabledNavigationButton]}>
                            <Text style={styles.navigationButtonText}>Submit</Text>
                        </TouchableOpacity>
                    )}
            </View>
        </View>
    );
}

function ProgressBar({ currentSlide }) {
    return (
        <View style={styles.progressBar}>
        {slides.map((slide, index) => (
            <View
            key={slide.id}
            style={[
                styles.progressItem,
                currentSlide === index && styles.activeProgressItem,
            ]}
            />
        ))}
        </View>
    );
}

const SignUpSlider = () => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
            <View style={styles.container}>
                <FormSlides />
            </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    scrollbox: {
        height: '85%',
    },
    hobbyButtonContainer: {
        paddingTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
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
    ageLabel: {
        fontSize: 20,
        marginTop: 20,
        textAlign: 'center',
    },
    view: {
        height: '100%',
        position: 'relative',
        width: '100%',
    },
    arrowLeftContainer: {
        position: 'absolute',
        top: -75,
        left: -29,
        zIndex: 1,
        padding: 20,
    },
    disabledNavigationButton: {
        opacity: 0.3,
    },
    arrowLeft: {
        padding: 10,
    },
    title: {
        textAlign: 'left',
        fontSize: 22,
        fontFamily: 'Georgia',
        marginBottom: 10,
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    navigationButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        paddingVertical:10,
    },
    datePickerContainer: {
        alignItems: 'center',
    },
    datePicker: {
        paddingBottom: 0,
    },
    progressItem: {
        width: 36,
        height: 5,
        backgroundColor: '#CCCCCC',
        borderRadius: 5,
    },
    activeProgressItem: {
        backgroundColor: '#FF5A5F',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 100,
    },
    heightPicker: {
        marginBottom: 200,
    },
    pickerItem: {
        flex: 1,
        marginHorizontal: 10,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    container: {
        paddingTop: '25%',
        marginHorizontal: 20,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 10,
    },
    navigationButton: {
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
        width: '100%',
    },
    activeButton: {
        backgroundColor: '#FF5A5F',
    },
    buttonText: {
        color: '#000000',
    },
    activeButtonText: {
        color: '#FFFFFF',
    },
});

export default SignUpSlider;
