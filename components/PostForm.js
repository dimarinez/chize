import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Modal, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { REACT_NATIVE_GOOGLE_PLACE } from '@env';
import { useNavigation } from '@react-navigation/native';
import UserContext from '../context/UserContext';
import { supabase } from '../supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PostForm = ({ route }) => {
  const [predictions, setPredictions] = useState([]);
  const [locationValue, setLocationValue] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [currPlaceCoordinates, setCurrPlaceCoordinates] = useState({});
  const { user, setCurrPlaceId, currLocation, activePost, setActivePost, currPlaceId, setImage, image, locationDescription, setLocationDescription } = useContext(UserContext);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
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

  const loadPlaces = () => {
    axios
      .get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${currLocation?.coords.latitude}, ${currLocation?.coords.longitude}`,
          key: REACT_NATIVE_GOOGLE_PLACE,
          rankby: 'distance',
          components: 'country:us', // Limit results to the US
          types: 'cafe|restaurant|bar|gym',
        },
      })
      .then((response) => {
        const predictionsPlaces = response.data.results
          .map((result) => ({
            place_id: result.place_id,
            description: result.name,
            coords: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
            },
          }))
          .filter((prediction) => {
            // Calculate the distance between the user and the prediction coordinates
            const distanceInMeters = calculateDistance(
              currLocation.coords.latitude,
              currLocation.coords.longitude,
              prediction.coords.lat,
              prediction.coords.lng
            );

            // Keep the prediction if it is within 10 meters
            return distanceInMeters <= 500;
          })
          .slice(0, 3); // Limit the results to the closest 3 predictions

        setPredictions(predictionsPlaces);
      })
      .catch((error) => {
        console.log('Places search error:', error);
      });
  };

  const takePhoto = () => {
    navigation.navigate('CameraComponent');
  };

  useEffect(() => {
    if (route?.params) {
      const { photo } = route.params;
      setImage(photo);
    } else if (activePost) {
      setLocationValue(activePost.location);
      setImage({ uri: activePost.photo });
    }

    if (!activePost && locationDescription && image && !currPlaceId) {
      setImage(null);
      setLocationDescription('');
    }

    if (activePost) {
      setLocationDescription(activePost.locationDescription);
    }
    loadPlaces();
  }, [route]);

  const handleDeletePost = async () => {
    try {
      await supabase
      .from('matches')
      .delete()
      .or(`user1_id.eq.${user.user_id},user2_id.eq.${user.user_id}`)
      .eq('place_id', currPlaceId);

      await supabase
      .from('requests')
      .delete()
      .or(`sender_id.eq.${user.user_id},receiver_id.eq.${user.user_id}`)
      .eq('place_id', currPlaceId);

      const { error: postError } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', user.user_id);

      if (postError) {
        console.log(postError);
        return;
      }

      setImage(null);
      setLocationDescription('');
      setActivePost(null);
      setCurrPlaceId(null);

      const { error: emptyError } = await supabase
        .storage
        .emptyBucket(user.user_id);

      if (emptyError) {
        console.log(emptyError);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const uploadPhoto = async () => {
    const fileName = `${user.user_id}_${Date.now()}.jpg`;
    try {
      const { error } = await supabase.storage
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
      try {
        const { error } = await supabase
          .storage
          .getBucket(user.user_id);

        if (error) {
          await supabase
            .storage
            .createBucket(user.user_id, {
              public: true,
            });
        }

        const publicURL = await uploadPhoto();

        const post = {
          photo: publicURL.data.publicUrl,
          location: locationValue,
          locationDescription,
          gender: user.gender,
          user_id: user.user_id,
          place_id: placeId,
          coords: currPlaceCoordinates,
        };

        const { data, error: errorMessage } = await supabase
          .from('posts')
          .insert([post]);

        if (data) {
          setActivePost(data[0]);
          setCurrPlaceId(placeId);
        } else if (!errorMessage && !data) {
          setActivePost(post);
          setCurrPlaceId(placeId);
        } else {
          console.log(errorMessage);
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleSetLocationDescription = text => {
    setLocationDescription(text);
  }

  const handlePredictionSelect = (prediction) => {
    setCurrPlaceCoordinates(prediction?.coords);
    setLocationValue(prediction?.description);
    setPlaceId(prediction?.place_id);
    setSelectedPrediction(prediction?.place_id);
  };

  const handleUpdate = async () => {
    try {
      const { error: emptyError } = await supabase
        .storage
        .emptyBucket(user.user_id);

      if (emptyError) {
        console.log(emptyError);
      }

      const { error: errorM } = await supabase
        .storage
        .getBucket(user.user_id);

      if (errorM) {
        await supabase
          .storage
          .createBucket(user.user_id, {
            public: true,
          });
      }

      const publicURL = await uploadPhoto();

      const { error: errorMessage } = await supabase
        .from('posts')
        .update(
          {
            photo: publicURL.data.publicUrl,
            locationDescription,
          },
        )
        .eq('user_id', user.user_id)
        .select();

      if (!errorMessage) {
        setActivePost({
          ...activePost,
          photo: publicURL.data.publicUrl,
          locationDescription,
        });
      }

      if (errorMessage) {
        console.log(errorMessage);
      } else {
        Keyboard.dismiss();
      }
    } catch (e) {
      console.log(e);
      Keyboard.dismiss();
    }
  };

  const retakePhoto = () => {
    setImage(null);
  };

  return (
    <>
      {activePost ? (
        <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.title}>Your Active Post</Text>
            <View style={styles.mapLocation}>
              <Icon name="store-marker" size={20} color="#000" /><Text style={styles.placeName}>{activePost.location}</Text>
            </View>
            <View style={styles.locationDescriptionContainer}>
              <Icon name="map-marker-account-outline" size={20} color="#000" />
              <TextInput
                style={styles.input}
                multiline
                placeholder="Ex: in line ordering a coffee"
                value={locationDescription}
                onChangeText={handleSetLocationDescription}
              />
            </View>
            {image && <Image source={image} style={styles.image} />}
            <View style={styles.postFormContainer}>
            {!image && <TouchableOpacity onPress={takePhoto} style={styles.photoButton}>
                <Text style={styles.photoSubmitText}>take photo <Icon name="camera" size={15} color="#FF5A5F"/></Text>
            </TouchableOpacity>}
            {image &&
              <TouchableOpacity  onPress={retakePhoto} style={styles.photoButton}>
                <Text style={styles.photoSubmitText}>retake photo <Icon name="camera" size={15} color="#FF5A5F"/></Text>
              </TouchableOpacity>
            }
            <TouchableOpacity onPress={handleDeletePost} style={styles.photoButton}>
                <Text style={styles.photoSubmitText}>delete</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
            style={[styles.profileSubmit, isSubmitDisabled && styles.disabledButton]}
            disabled={isSubmitDisabled}
            onPress={handleUpdate}>
                <Text style={styles.profileSubmitText}>update</Text>
            </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
        </>
      ) : (
        <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.inputContainer}>
              <Text style={styles.titleForm}>Nearby locations:</Text>
              {predictions && predictions?.length > 0 ? (
                <FlatList
              style={styles.predictionsList}
              data={predictions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.predictionItem,
                    item.place_id === selectedPrediction && styles.activePrediction,
                  ]}
                  onPress={() => handlePredictionSelect(item)}
                >
                  <Text style={[styles.predictionText, item.place_id === selectedPrediction && styles.activePredictionText]}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
              ):(
                <Text>You aren't by any places</Text>
            )}
            </View>
            <View>
              <Text style={styles.titleForm}>Where are you in this place?</Text>
              <View style={styles.locationDescriptionContainer}>
              <Icon name="map-marker-account-outline" size={20} color="#000" />
              <TextInput
                style={styles.input}
                multiline
                placeholder="Ex: in line ordering a coffee"
                value={locationDescription}
                onChangeText={handleSetLocationDescription}
              />
              </View>
            </View>
            {image && 
            <TouchableOpacity style={styles.previewButton} onPress={() => {
              setModalVisible(true);
            }}>
              <Image source={image} style={styles.image} />
            </TouchableOpacity>
            }
            {!image && <TouchableOpacity onPress={takePhoto} style={styles.photoButtonForm}>
                <Text style={styles.photoSubmitText}>take photo <Icon name="camera" size={15} color="#FF5A5F"/></Text>
            </TouchableOpacity>}
            {image &&
              <TouchableOpacity  onPress={retakePhoto} style={styles.photoButtonForm}>
                <Text style={styles.photoSubmitText}>retake photo <Icon name="camera" size={15} color="#FF5A5F"/></Text>
              </TouchableOpacity>
            }
            <TouchableOpacity onPress={handlePostSubmit}
              style={[styles.profileSubmit, isSubmitDisabled && styles.disabledButton]}
              disabled={isSubmitDisabled}
            >
                <Text style={styles.profileSubmitText}>chise</Text>
            </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
        </>
      )
      }
    <Modal visible={modalVisible} animationType="slide" style={styles.modal}>
    <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.close} onPress={() => {
            setModalVisible(false);
        }} >
            <Icon name="window-close" size={30} color="#000000" />
        </TouchableOpacity>
        <Image source={image} style={styles.imagePreview} />
    </View>
  </Modal>
  </>
  );
};

const styles = StyleSheet.create({
  previewButton: {
    width: 200,
  },
  disabledButton: {
    opacity: 0.3,
  },
  look: {
    marginBottom: 10,
  },
  modal: {
    height: '100%',
    width: '100%',
  },
  modalContainer: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 20,
  },
imagePreview: {
  height: 400,
  width: '100%',
},
close: {
    position: 'absolute',
    right: 20,
    top:60,
    zIndex: 1,
},
  mapLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  postFormContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 20,
    marginLeft: 3,
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
  width: '48%',
  paddingHorizontal: 20,
},
titleForm: {
  textAlign: 'left',
  fontSize: 22,
  fontFamily: 'Georgia',
  marginBottom: 5,
  marginTop: '2%',
},
title: {
    textAlign: 'left',
    fontSize: 26,
    fontFamily: 'Georgia',
    marginBottom: 15,
    marginTop: '2%',
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
  fontWeight: 'bold',
  textAlign: 'center',
},
input: {
  marginLeft: 3,
  fontSize: 20,
},
profileSubmit: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 15,
    width: '100%',
    position: 'absolute',
    marginHorizontal: 20,
    bottom: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
},
  container: {
    flex: 1,
    paddingTop: '15%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  image: {
    marginTop: 20,
    width: 200,
    height: 200,
  },
  predictionsList: {
    marginTop: 15,
    marginBottom: 10,
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
