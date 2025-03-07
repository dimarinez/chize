import React, { useEffect, useContext, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet, Text } from 'react-native';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import { REACT_NATIVE_GOOGLE_PLACE } from '@env';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Map = ({activepost}) => {
  const { currLocation, user } = useContext(UserContext);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [isMapViewVisible, setIsMapViewVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: currLocation?.coords.latitude || 0,
    longitude: currLocation?.coords.longitude || 0,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0122,
  });

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
          {
            params: {
              location: `${currLocation?.coords.latitude},${currLocation?.coords.longitude}`,
              key: REACT_NATIVE_GOOGLE_PLACE,
              rankby: 'distance',
            },
          }
        );

        if (response.data.results) {
          const predictionsPlaces = response.data.results.map((result) => ({
            place_id: result?.place_id,
            description: result?.name,
            coords: {
              lat: result?.geometry.location.lat,
              lng: result?.geometry.location.lng,
            },
          }));

          // Fetch posts from Supabase and filter based on place_id
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .in('place_id', predictionsPlaces.map((place) => place?.place_id))
            .eq('active', true)
            .eq('preference', user.preference);

          const filteredMarkers = predictionsPlaces.filter((prediction) =>
            postsData.some((post) => post?.place_id === prediction?.place_id)
          );

          setMapMarkers(filteredMarkers);
        }
      } catch (error) {
        console.log('Places search error:', error);
      }
    };

    const delayLoad = setTimeout(() => {
        if (activepost) {
            const { lat, lng } = activepost.coords;
            setMapRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0122,
            });
        } else {
            loadPlaces();
        }
        setIsMapViewVisible(true);
    }, 500); // Adjust the delay time as needed

    return () => clearTimeout(delayLoad);
  }, [currLocation, user?.preference]);

  return (
    <View style={styles.container}>
        {activepost && isMapViewVisible ? (
            <>
                <Text style={styles.activeName}>Active Post</Text>
                <MapView style={styles.map} region={mapRegion}>
                    <Marker
                        key={activepost.place_id}
                        coordinate={{
                            latitude: activepost.coords.lat,
                            longitude: activepost.coords.lng,
                        }}
                        title={activepost.location}
                    />
                </MapView>
            </>
        ) : mapMarkers.length > 0 && isMapViewVisible ? (
            <>
                <Text style={styles.activeName}>Active Nearby</Text>
                <MapView style={styles.map} region={mapRegion}>
                    {mapMarkers.map((post) => (
                        <Marker
                            key={post.place_id}
                            coordinate={{
                                latitude: post.coords.lat,
                                longitude: post.coords.lng,
                            }}
                            title={post.description}
                        >
                            <Icon name="map-marker-account" style={styles.markerStyle} size={30} color="#FF5A5F" />
                        </Marker>
                    ))}
                </MapView>
            </>
        ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
    activeName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    markerStyle: {
        bottom: 10,
    },
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  map: {
    flex: 1,
  },
});

export default Map;
