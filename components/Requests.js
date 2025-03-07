import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import navigateToScreen from '../PushNotification';

const Requests = ({navigation}) => {
    const [requests, setRequests] = useState(null);
    const { user, currPlaceId } = useContext(UserContext);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [displayLoader, setDisplayLoader] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        navigateToScreen().then(screenName => {
            if (screenName) {
                navigation.navigate(screenName);
            }
        });

        const getRequestsAndPosts = async () => {
            setDisplayLoader(true);
            try {
              const { data: requestData, error: requestError } = await supabase
                .from('requests')
                .select('*')
                .eq('receiver_id', user.user_id);

              if (requestError) {
                console.log('Error fetching requests:', requestError);
              } else {
                // Format the interests array for each request and fetch the corresponding sender profiles
                const formattedRequests = [];
                for (const request of requestData) {
                  const { data: senderProfileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', request.sender_id);

                  if (profileError) {
                    console.log('Error fetching sender profile:', profileError);
                  } else {
                    const senderProfile = senderProfileData[0]; // Assuming there's only one profile per user
                    const interests = senderProfile?.interests || [];
                    const formattedInterests = interests.join(', ');

                    formattedRequests.push({
                      ...request,
                      profiles: {
                        ...senderProfile,
                        interests: formattedInterests,
                      },
                    });
                  }
                }
                setRequests(formattedRequests);
              }
            } catch (e) {
                console.log(e);
            } finally {
                setDisplayLoader(false);
            }
        };

        getRequestsAndPosts();

        const requestsSubscription = supabase.channel('requests')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'requests' },
                (payload) => {
                    getRequestsAndPosts();
                })
                .subscribe();
          // Clean up the subscription when the component unmounts
          return () => {
            requestsSubscription.unsubscribe();
          };
    }, []);

    const handleAccept = async () => {
        if (selectedRequest && user) {
            try {
                const { user_id } = user;
                const { error } = await supabase
                    .from('matches')
                    .insert([
                        {
                            user1_id: user_id,
                            user2_id: selectedRequest.profiles.user_id,
                            place_id: currPlaceId,
                            user1_deviceToken: user.deviceToken,
                            user2_deviceToken: selectedRequest.profiles.deviceToken,
                        },
                    ]);

                const { error: errorMessage } = await supabase
                    .from('requests')
                    .delete()
                    .eq('receiver_id', user.user_id)
                    .eq('sender_id', selectedRequest.profiles.user_id);

                if (errorMessage) {
                    console.log(error);
                }
            } catch (error) {
                console.log('Error calling RPC:', error);
            }
        }
        setModalVisible(false);
    };

    const handleDecline = async () => {
        try {
            const { error } = await supabase
                .from('requests')
                .delete()
                .eq('receiver_id', user.user_id)
                .eq('sender_id', selectedRequest.profiles.user_id);

            if (error) {
                console.log(error);
            }
        } catch (e) {
            console.log(e);
        }
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Waved at you</Text>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {displayLoader ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#FF5A5F" />
                </View>
            ) : (
                <View style={styles.requests}>
                {requests && requests.length > 0 ? (
                    requests.map((request) => (
                        <TouchableOpacity
                        key={request.profiles.id}
                        onPress={() => {
                            setSelectedRequest(request);
                            setModalVisible(true);
                        }}
                        style={styles.postContainer}
                        >
                        <View style={styles.requestNameContainer}>
                            <Text style={styles.postName}>{request.profiles.name}</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: request.sender_photo }} style={styles.image} />
                        </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.titleNone}>Nothing yet...</Text>
                )}
            </View>
            )}
            </ScrollView>
            <Modal visible={modalVisible} animationType="slide">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.close} onPress={() => {
                        setModalVisible(false);
                    }} >
                        <Icon name="window-close" size={24} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.requestName}>{selectedRequest?.profiles.name}</Text>
                    <View style={styles.requestImageContainer}>
                    <Image source={{ uri: selectedRequest?.sender_photo }} style={styles.postImage} />
                        <TouchableOpacity style={styles.heartButton} onPress={handleAccept}>
                            <Icon name="handshake-outline" size={24} color="#FF5A5F" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                            <Icon name="window-close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.postDetails}>
                        <View style={styles.attributes}>
                        <View style={styles.borderRightDetail}><Text style={styles.postDetail}><Icon name="cake-variant-outline" size={18} color="#000000" /> {selectedRequest?.profiles.age}</Text></View>
                        <Text style={styles.postDetail}><Icon name="ruler" size={18} color="#000000" /> {selectedRequest?.profiles.height.replace(/"{2}$/g, '"')}</Text>
                        </View>
                        <Text style={styles.postBio}>{selectedRequest?.profiles.details}</Text>
                        <View style={styles.interestsContainer}>
                        {selectedRequest?.profiles.interests && selectedRequest?.profiles.interests.split(',').map((interest) => (
                            <Text style={styles.interest} key={interest}>{interest}</Text>
                        ))}
                        </View>
                    </View>
                </View>
                </ScrollView>
            </Modal>
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
        width: '100%',
        height: '100%',
        zIndex: 3,
    },
    modalContainer: {
        paddingTop: 60,
    },
    postImage: {
        width: '100%',
        height: 500,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        paddingHorizontal: 20,
        marginHorizontal: -5,
    },
    interest: {
        backgroundColor: '#eaeaea',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        margin: 5,
    },
    postDetail: {
        fontSize: 16,
        color: '#000',
        paddingHorizontal: 20,
    },
    postBio: {
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
    },
    borderRightDetail: {
        borderRightColor: '#000',
        borderRightWidth: 1,
    },
    attributes: {
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 15,
    },
    postDetails: {
        borderRadius: 10,
        backgroundColor:'white',
        overflow: 'hidden',
    },
    declineButton: {
        backgroundColor: 'white',
        padding: 10,
        position: 'absolute',
        bottom: 10,
        left: 10,
        borderRadius: 50,
        zIndex: 1,
    },
    heartButton: {
        backgroundColor: 'white',
        padding: 10,
        position: 'absolute',
        bottom: 10,
        right: 10,
        borderRadius: 50,
        zIndex: 1,
    },
    requestImageContainer: {
        marginHorizontal: 20,
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
    },
    requestName: {
        paddingHorizontal: 20,
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    title: {
        textAlign: 'left',
        fontSize: 26,
        marginTop: '2%',
        marginBottom: 10,
        fontFamily: 'Georgia',
    },
    requestNameContainer: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'white',
        padding: 10,
    },
    imageContainer: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
    },
    titleNone: {
        textAlign: 'left',
        fontSize: 22,
        fontFamily: 'Georgia',
        marginTop: 20,
    },
    requests: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        paddingTop: '15%',
        paddingHorizontal: 20,
    },
    postContainer: {
        paddingVertical: 10,
        width: '48%',
    },
    postName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    postGender: {
        fontSize: 14,
        color: '#888',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalGender: {
        fontSize: 16,
        color: '#888',
        marginBottom: 20,
    },
    modalDetails: {
        fontSize: 14,
        marginBottom: 20,
    },
    close: {
        position: 'absolute',
        right: 20,
        top:60,
        zIndex: 1,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default Requests;
