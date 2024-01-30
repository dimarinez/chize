import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, ScrollView } from 'react-native';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import navigateToScreen from '../PushNotification';

const Matches = ({navigation}) => {
    const [matches, setMatches] = useState(null);
    const { user } = useContext(UserContext);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        navigateToScreen().then(screenName => {
            if (screenName) {
              navigation.navigate(screenName);
            }
        });

        const getMatchesAndPosts = async () => {
            setMatches([]);
            try {
              const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .or(`user1_id.eq.${user.user_id},user2_id.eq.${user.user_id}`);

              if (matchesError) {
                console.error('Error fetching matches:', matchesError.message);
              } else {
                const formattedMatches = [];

                for (const match of matchesData) {
                  // Find the user ID that is not equal to user.user_id
                  const otherUserId = match.user1_id !== user.user_id ? match.user1_id : match.user2_id;

                  const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('user_id', otherUserId)
                    .eq('active', true);

                  if (postsError) {
                    console.error('Error fetching posts:', postsError.message);
                  } else {
                    for (const post of postsData) {
                      const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('user_id', post.user_id);

                      if (profileError) {
                        console.log('Error fetching sender profile:', profileError);
                      } else {
                        const profile = profileData[0]; // Assuming there's only one profile per user
                        const interests = profile?.interests || [];
                        const formattedInterests = interests.join(', ');

                        formattedMatches.push({
                          ...post,
                          profiles: {
                            ...profile,
                            interests: formattedInterests,
                          },
                        });
                      }
                    }
                  }
                }
                setMatches(formattedMatches);
              }
            } catch (e) {
              console.log(e);
            }
        };

        getMatchesAndPosts();

        const matchesSubscription = supabase.channel('matches')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'matches' },
            (payload) => {
                getMatchesAndPosts();
            })
            .subscribe();
      // Clean up the subscription when the component unmounts
      return () => {
        matchesSubscription.unsubscribe();
      };
    }, []);

    const handleDecline = async () => {
        try {
            const { error } = await supabase
                .from('matches')
                .delete()
                .or(`user1_id.eq.${user.user_id},user2_id.eq.${user.user_id}`)
                .or(`user1_id.eq.${selectedMatch.profiles.user_id},user2_id.eq.${selectedMatch.profiles.user_id}`);

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
                <Text style={styles.title}>Matches</Text>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.requests}>
                    {matches && matches.length > 0 ? (
                        matches.map((match) => (
                            <TouchableOpacity
                            key={match.id}
                            onPress={() => {
                                setSelectedMatch(match);
                                setModalVisible(true);
                            }}
                            style={styles.postContainer}
                            >
                            <View style={styles.requestNameContainer}>
                                <Text style={styles.postName}>{match.profiles.name}</Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: match.photo }} style={styles.image} />
                            </View>
                            <View style={styles.locationDescription}><Text style={styles.locationDescriptionText}><Icon name="map-marker-account-outline" size={16} color="#000" /> {match?.locationDescription}</Text></View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.titleNone}>No matches yet...</Text>
                    )}
                </View>
                </ScrollView>
                <Modal visible={modalVisible} animationType="slide">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.close} onPress={() => {
                            setModalVisible(false);
                        }} >
                            <Icon name="window-close" size={24} color="#000000" />
                        </TouchableOpacity>
                        <Text style={styles.requestName}>{selectedMatch?.profiles.name}</Text>
                        <View style={styles.requestImageContainer}>
                        <Image source={{ uri: selectedMatch?.photo }} style={styles.postImage} />
                            <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                                <Icon name="window-close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.postDetails}>
                            <View style={styles.attributes}>
                            <View style={styles.borderRightDetail}><Text style={styles.postDetail}><Icon name="cake-variant-outline" size={18} color="#000000" /> {selectedMatch?.profiles.age}</Text></View>
                            <Text style={styles.postDetail}><Icon name="ruler" size={18} color="#000000" /> {selectedMatch?.profiles.height.replace(/"{2}$/g, '"')}</Text>
                            </View>
                            <Text style={styles.postBio}>{selectedMatch?.profiles.details}</Text>
                            <View style={styles.interestsContainer}>
                            {selectedMatch?.profiles.interests && selectedMatch?.profiles.interests.split(',').map((interest) => (
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
    locationDescription: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
        padding: 10,
        backgroundColor: 'white',
    },
    locationDescriptionText: {
        fontSize: 16,
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
        fontFamily: 'Georgia',
        marginTop: '2%',
        marginBottom: 10,
    },
    requestNameContainer: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'white',
        padding: 10,
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

export default Matches;
