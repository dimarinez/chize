import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  View,
  TextInput,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import {REACT_NATIVE_GOOGLE_PLACE} from '@env';
import {useNavigation} from '@react-navigation/native';
import UserContext from '../context/UserContext';
import {supabase} from '../supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import navigateToScreen from '../PushNotification';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

const PostForm = ({route}) => {
  const [predictions, setPredictions] = useState([]);
  const [locationValue, setLocationValue] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [numberOfPosts, setNumberOfPosts] = useState(0);
  const [displayLoader, setDisplayLoader] = useState(false);
  const [currPlaceCoordinates, setCurrPlaceCoordinates] = useState({});
  const {
    user,
    setCurrPlaceId,
    currLocation,
    activePost,
    setActivePost,
    setUser,
    currPlaceId,
    setImage,
    image,
    locationDescription,
    setLocationTypeChange,
    setLocationDescription,
  } = useContext(UserContext);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const navigation = useNavigation();
  const isSubmitDisabled = !locationValue || !image || !locationDescription;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180; // Convert latitude to radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
  };

  const loadPlaces = async () => {
    setDisplayLoader(true); // Set loading state to true

    axios
      .get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${currLocation?.coords.latitude}, ${currLocation?.coords.longitude}`,
          key: REACT_NATIVE_GOOGLE_PLACE,
          rankby: 'distance',
          components: 'country:us', // Limit results to the US
        },
      })
      .then(response => {
        const predictionsPlaces = response.data.results
          .map(result => ({
            types: result?.types,
            place_id: result?.place_id,
            description: result?.name,
            coords: {
              lat: result?.geometry.location.lat,
              lng: result?.geometry.location.lng,
            },
          }))
          .filter(prediction => {
            const desiredTypes = user?.locationTypes || [
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

            // Calculate the distance between the user and the prediction coordinates
            const distanceInMeters = calculateDistance(
              currLocation.coords.latitude,
              currLocation.coords.longitude,
              prediction.coords.lat,
              prediction.coords.lng,
            );

            // // Check if any of the prediction types is in the desiredTypes array
            const hasDesiredType = prediction.types.some(type =>
              desiredTypes.includes(type),
            );

            // Keep the prediction if it is within 10 meters and has a desired type
            return distanceInMeters <= user.radius && hasDesiredType;
          })
          .slice(0, user.numberOfSuggestions);

        setPredictions(predictionsPlaces);
      })
      .catch(error => {
        console.log('Places search error:', error);
      })
      .finally(() => {
        setDisplayLoader(false); // Set loading state to false when done
        setLocationTypeChange(false);
      });
  };

  const takePhoto = () => {
    navigation.navigate('CameraComponent');
  };

  useEffect(() => {
    loadPlaces();

    // Navigate to screen when the component mounts or when activePost changes
    navigateToScreen().then(screenName => {
      if (screenName) {
        navigation.navigate(screenName);
      }
    });

    // Update component state if there's an activePost
    if (activePost) {
      setLocationValue(activePost.location);
      setImage({ uri: activePost.photo });
      setLocationDescription(activePost.locationDescription);
    }
  }, [activePost]);

  useFocusEffect(
    React.useCallback(() => {
      if (!activePost) {
        loadPlaces();
      }
    }, [user?.locationTypes, user?.radius, user?.numberOfSuggestions])
  );

  const handleDeletePost = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this post?',
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
              setDisplayLoader(true);
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
              setSelectedPrediction(null);

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
                Toast.show({
                  type: 'success',
                  text1: 'Success!',
                  text2: 'Your post was successfully deleted.',
                });
              }
              setDisplayLoader(false);
            } catch (e) {
              console.log(e.message);
              setDisplayLoader(false);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleRetakePhoto = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            retakePhoto();
          },
        },
      ],
      {cancelable: true},
    );
  };

  const uploadPhoto = async () => {
    const fileName = `${user.user_id}_${Date.now()}.jpg`;
    try {
      const {error} = await supabase.storage
        .from(user.user_id)
        .upload(fileName, image);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      } else {
        const publicURL = await supabase.storage
          .from(user.user_id)
          .getPublicUrl(fileName);
        return publicURL;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handlePostSubmit = async () => {
    if (image) {
      setDisplayLoader(true);
      try {
        if (user?.subscriptionType || user.numberOfPosts < 1) {
          setNumberOfPosts(user.numberOfPosts + 1);
          const { error: bucketError } = await supabase.storage.getBucket(user.user_id);
  
          if (bucketError) {
            await supabase.storage.createBucket(user.user_id, {
              public: true,
            });
          }
  
          const publicURL = await uploadPhoto();
  
          const { data: postData, error: postError } = await supabase
            .from('posts')
            .insert([
              {
                photo: publicURL?.data.publicUrl,
                location: locationValue,
                locationDescription,
                gender: user.gender,
                user_id: user.user_id,
                place_id: placeId,
                preference: user.preference,
                active: true,
                coords: currPlaceCoordinates,
              },
            ]);
  
          await supabase
            .from('profiles')
            .update({
              numberOfPosts: numberOfPosts,
            })
            .eq('user_id', user.user_id)
            .select();
  
          if (postError) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: postError.message, // Display the error message
            });
          } else {
            Toast.show({
              type: 'success',
              text1: 'Success!',
              text2: 'Your post is live!',
            });
            setUser({
              ...user,
              numberOfPosts,
            });
  
            if (postData) {
              setActivePost(postData[0]);
            }
            setCurrPlaceId(placeId);
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'No more posts for the day!',
            text2: 'Subscribe for more posts',
          });
        }
        setDisplayLoader(false);
      } catch (e) {
        setDisplayLoader(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred while submitting your post.', // Display a generic error message
        });
        console.log(e, 'this is the error');
      }
    }
  }

  const handleSetLocationDescription = text => {
    setLocationDescription(text);
  };

  const handlePredictionSelect = prediction => {
    setCurrPlaceCoordinates(prediction?.coords);
    setLocationValue(prediction?.description);
    setPlaceId(prediction?.place_id);
    setSelectedPrediction(prediction?.place_id);
  };

  // const handleUpdate = async () => {
  //   try {
  //     const {error: emptyError} = await supabase.storage.emptyBucket(
  //       user.user_id,
  //     );

  //     if (emptyError) {
  //       console.log(emptyError);
  //     }

  //     const {error: errorM} = await supabase.storage.getBucket(user.user_id);

  //     if (errorM) {
  //       await supabase.storage.createBucket(user.user_id, {
  //         public: true,
  //       });
  //     }

  //     const publicURL = await uploadPhoto();

  //     const {error: errorMessage} = await supabase
  //       .from('posts')
  //       .update({
  //         photo: publicURL.data.publicUrl,
  //         locationDescription,
  //       })
  //       .eq('user_id', user.user_id)
  //       .eq('active', true)
  //       .select();

  //     if (errorMessage) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Error',
  //         text2: emptyError,
  //       });
  //     } else {
  //       Toast.show({
  //         type: 'success',
  //         text1: 'Success!',
  //         text2: 'Your post was successfully updated.',
  //       });
  //       setActivePost({
  //         ...activePost,
  //         photo: publicURL.data.publicUrl,
  //         locationDescription,
  //       });
  //       Keyboard.dismiss();
  //     }

  //   } catch (e) {
  //     console.log(e);
  //     Keyboard.dismiss();
  //   }
  // };

  const retakePhoto = () => {
    setImage(null);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          {activePost ? (
            <>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                  {/* Display the active post information */}
                  <View style={styles.activeContainer}>
                    <Text style={styles.titleActive}>Your Active Post</Text>
                    <TouchableOpacity
                      onPress={handleDeletePost}
                      style={styles.deletePost}>
                      <Icon name="window-close" size={24} color="#000000" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.detailContaier}>
                    <View style={styles.mapLocationSet}>
                      <Icon name="store-marker" size={20} color="#000" />
                      <Text style={styles.placeName}>
                        {activePost.location}
                      </Text>
                    </View>
                    <View style={styles.locationDescriptionContainerSet}>
                      <Icon
                        name="map-marker-account-outline"
                        size={20}
                        color="#000"
                      />
                      <Text style={styles.placeName}>
                        {activePost.locationDescription}
                      </Text>
                      {/* <TextInput
                        style={styles.input}
                        multiline
                        placeholder="Ex: in line ordering a coffee"
                        value={locationDescription}
                        onChangeText={handleSetLocationDescription}
                      /> */}
                    </View>
                  </View>
                  {image && (
                    <View style={styles.imageContainer}>
                      <Image source={image} style={styles.image} />
                      {/* {image && (
                        <TouchableOpacity
                          onPress={handleRetakePhoto}
                          style={styles.retakePhotoButton}>
                          <Text style={styles.retakePhotoButtonText}>
                            <Icon name="window-close" size={24} color="#FFFFFF" />
                          </Text>
                        </TouchableOpacity>
                      )} */}
                    </View>
                  )}
                  {/* <View style={styles.postFormContainer}>
                    {!image && (
                      <TouchableOpacity
                        onPress={takePhoto}
                        style={styles.photoButton}>
                        <Text style={styles.photoSubmitText}>
                          take photo{' '}
                          <Icon name="camera" size={15} color="#FF5A5F" />
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View> */}
                </View>
              </TouchableWithoutFeedback>
            </>
          ) : (
            <>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.titleForm}>Choose a location:</Text>
                    {predictions &&
                    predictions?.length > 0 ? (
                      <View style={styles.predictionsList}>
                        {predictions.map(item => (
                          <TouchableOpacity
                            key={item.place_id}
                            style={[
                              styles.predictionItem,
                              item.place_id === selectedPrediction &&
                                styles.activePrediction,
                            ]}
                            onPress={() => handlePredictionSelect(item)}>
                            <Text
                              style={[
                                styles.predictionText,
                                item.place_id === selectedPrediction &&
                                  styles.activePredictionText,
                              ]}>
                              {item.description}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.marginBottom}>
                        No places around you
                      </Text>
                    )}
                  </View>
                  <View style={styles.whereContainer}>
                    <Text style={styles.titleForm}>
                      Where are you in this place?
                    </Text>
                    <View style={styles.locationDescriptionContainer}>
                      <Icon
                        name="map-marker-account-outline"
                        size={20}
                        color="#000"
                      />
                      <TextInput
                        style={styles.input}
                        multiline
                        placeholder="Ex: in line ordering a coffee"
                        value={locationDescription}
                        onChangeText={handleSetLocationDescription}
                      />
                    </View>
                  </View>
                  {image && (
                    <View style={styles.imageContainer}>
                      <Image source={image} style={styles.image} />
                      {image && (
                        <TouchableOpacity
                        onPress={handleRetakePhoto}
                        style={styles.retakePhotoButton}>
                          <Text style={styles.retakePhotoButtonText}>
                            <Icon name="window-close" size={24} color="#FFFFFF" />
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  {!image && (
                    <TouchableOpacity
                      onPress={takePhoto}
                      style={styles.photoButtonForm}>
                      <Text style={styles.photoSubmitText}>
                        <Text>
                        take photo{' '}
                        </Text>
                        <Icon name="camera" size={15} color="#FF5A5F" style={styles.camera}/>
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </>
          )}
        </ScrollView>
        <View style={styles.buttonBackground}>
          {!activePost && (
            <TouchableOpacity
              onPress={handlePostSubmit}
              style={[
                styles.profileSubmit,
                isSubmitDisabled && styles.disabledButton,
              ]}
              disabled={isSubmitDisabled}>
              <Text style={styles.profileSubmitText}>Chize</Text>
            </TouchableOpacity>
          )}
        </View>
        {displayLoader && 
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
        </View>}
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  activeContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: '2%',
    alignItems: 'center',
  },
  retakePhotoButton: {
    color: '#FFFFFF',
    position: 'absolute',
    top: 35,
    right: 15,
  },
  retakePhotoButtonText: {
    color: '#fff',
  },
  imageContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  detailContaier: {
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonBackground: {
    backgroundColor: '#ffffff',
    paddingBottom: 10,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    opacity: 0.6,
    zIndex: 3,
  },
  marginBottom: {
    marginBottom: 10,
  },
  noplace: {
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 5,
  },
  previewButton: {
    width: 200,
  },
  disabledButton: {
    opacity: 0.3,
  },
  look: {
    marginBottom: 10,
  },
  close: {
    position: 'absolute',
    right: 20,
    top: 60,
    zIndex: 1,
  },
  mapLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  mapLocationSet: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  locationDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  locationDescriptionContainerSet: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCCCCC',
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  postFormContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  placeName: {
    fontSize: 16,
    marginLeft: 5,
  },
  photoButtonForm: {
    borderColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  photoButton: {
    borderColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  titleForm: {
    textAlign: 'left',
    fontSize: 22,
    fontFamily: 'Georgia',
    marginBottom: 15,
    marginTop: '2%',
  },
  title: {
    textAlign: 'left',
    fontSize: 26,
    fontFamily: 'Georgia',
  },
  titleActive: {
    textAlign: 'left',
    fontSize: 26,
    fontFamily: 'Georgia',
  },
  profileSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  photoSubmitText: {
    color: '#FF5A5F',
    fontSize: 16,
    alignContent: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginLeft: 5,
    fontSize: 16,
    marginBottom: 3,
    width: '100%',
  },
  profileSubmit: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 15,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  container: {
    flex: 1,
    paddingTop: '15%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  image: {
    marginTop: 20,
    width: '100%',
    height: 500,
  },
  predictionItem: {
    padding: 20,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 50,
    marginBottom: 10,
    // Remove color attribute from the predictionItem style.
  },
  activePrediction: {
    backgroundColor: '#000',
    // Add color attribute to the activePrediction style.
    color: '#ffffff',
  },
  predictionText: {
    fontSize: 16,
    // Add color attribute to the predictionText style.
    color: '#000',
  },
  activePredictionText: {
    // Add color attribute to the activePredictionText style.
    color: '#ffffff',
  },
});

export default PostForm;
