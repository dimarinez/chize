import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UserContext from '../context/UserContext';

const CameraComponent = () => {
  const camera = useRef(null);
  const [cameraType, setCameraType] = useState('front');
  const device = useCameraDevice(cameraType);
  const navigation = useNavigation();
  const [showCamera, setShowCamera] = useState(true);
  const [imageSource, setImageSource] = useState('');
  const {
    setImage,
    image,
  } = useContext(UserContext);

  const toggleCameraType = () => {
    const newCameraType = cameraType === 'back' ? 'front' : 'back';
    setCameraType(newCameraType);
  };

  const usePhoto = () => {
    setShowCamera(true);
    const imageData = {
      uri: `file://'${imageSource}`,
    }
    setImage(imageData);
    navigation.navigate('PostForm');
  }

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
    }
    getPermission();
  }, [image]);

  const capturePhoto = async () => {
    if (camera.current !== null) {
      const photo = await camera.current.takePhoto({});
      setImageSource(photo.path);
      setShowCamera(false);
    }
  };

  if (device == null) {
    return <Text>Camera not available</Text>;
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            photo={true}
          />
            <Image style={styles.emptyImage} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.camButton}
              onPress={() => capturePhoto()}
            />
            <TouchableOpacity
                style={styles.flipButton}
                onPress={() => toggleCameraType()}>
                  <Icon name="camera-flip-outline" size={30} color="#ffffff" />
              </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {imageSource !== '' ? (
            <Image
              style={styles.image}
              source={{
                uri: `file://'${imageSource}`,
              }}
            />
          ) : null}

          {/* <View style={styles.backButton}>
            <TouchableOpacity
              onPress={() => setShowCamera(true)}>
              <Icon name="window-close" color="#fff" size={40}/>
            </TouchableOpacity>
          </View> */}
          <View style={styles.buttonContainer}>
            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={() => setShowCamera(true)}>
                  <Icon name="redo" size={30} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={usePhoto}>
                <Icon name="check" size={30} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyImage: {
    height: 500,
    borderWidth: 1,
    borderColor: '#fff',
    right: 20,
    left: 20,
    position: 'absolute',
  },
  flipButton: {
    position: 'absolute',
    right: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#000',
  },
  button: {
    backgroundColor: 'gray',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.0)',
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
    top: '2%',
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#B2BEB5',
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 9 / 16,
  },
});

  export default CameraComponent;
