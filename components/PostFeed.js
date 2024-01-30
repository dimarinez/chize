import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { supabase } from '../supabase';
import UserContext from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const { currPlaceId, user, activePost, setActivePost } = useContext(UserContext);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('place_id', currPlaceId)
          .eq('preference', user.preference)
          .eq('active', true)
          .neq('user_id', user.user_id);

        if (postsError) {
          console.log('Error fetching posts:', postsError);
        } else {
          const formattedPosts = [];

          for (const post of postsData) {
            try {
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

                formattedPosts.push({
                  ...post,
                  profiles: {
                    ...profile,
                    interests: formattedInterests,
                  },
                });
              }
            } catch (profileError) {
              console.log('Error fetching sender profile:', profileError);
            }
          }

          if (formattedPosts.length > 0) {
            setPosts(formattedPosts);
          }
        }
      } catch (error) {
        console.log('Error fetching posts:', error);
      }
    };

    // Initial fetch of posts when the component mounts
    if (currPlaceId) {
      setPosts([]); // Clear the previous posts before fetching new ones
      fetchPosts();
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Adjust the duration as needed
      useNativeDriver: true,
    }).start();

    // Subscribe to real-time changes in the "posts" table
    const postsSubscription = supabase
        .channel('posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          (payload) => {
            fetchPosts();
          })
          .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      postsSubscription.unsubscribe();
    };
  }, [currPlaceId]); // Run this effect whenever currPlaceId changes

  const handleRequest = async (post) => {
    if (post && user) {
      try {
        const { user_id } = user;
        const { data: requestData } = await supabase
          .from('requests')
          .select('*')
          .eq('receiver_id', user_id)
          .eq('sender_id', post.profiles.user_id);

        if (requestData?.length) {
          const { error } = await supabase
            .from('matches')
            .insert([
              {
                user1_id: user_id,
                user2_id: post.profiles.user_id,
                place_id: currPlaceId,
                user1_deviceToken: user.deviceToken,
                user2_deviceToken: post.profiles.deviceToken,
              },
            ]);

          const { error: errorMessage } = await supabase
            .from('requests')
            .delete()
            .eq('receiver_id', user_id)
            .eq('sender_id', post.profiles.user_id);

          if (errorMessage) {
            console.log('Error calling RPC:', error);
          } else {
            console.log('RPC called successfully');
          }
          console.log('stack called');
        } else {
          console.log('stack called inserted');
          const { error } = await supabase
            .from('requests')
            .insert([
              {
                sender_id: user_id,
                sender_photo: activePost.photo,
                receiver_id: post.profiles.user_id,
                receiver_deviceToken: post.profiles.deviceToken,
                sender_location: activePost.locationDescription,
                place_id: currPlaceId,
              },
            ]);

          if (error) {
            console.log('Error calling RPC:', error);
          } else {
            console.log('RPC called successfully');
          }
        }

        try {
          const activeRequests = activePost?.requests || [];
          activeRequests.push(post.id);

          const { error: errorMessage } = await supabase
            .from('posts')
            .update({ requests: activeRequests })
            .eq('user_id', user.user_id)
            .eq('active', true);

          setActivePost({...activePost, requests: activeRequests});

          setCurrentPostIndex(currentPostIndex + 1);

          if (errorMessage) {
            console.log('Error updating requests:', errorMessage);
          } else {
            console.log('Requests updated successfully!');
          }
        } catch (e) {}
      } catch (error) {
        console.log('Error calling RPC:', error);
      }
    }
  };

  const handleDecline = async (post) => {
    try {
      const activeDeclines = activePost?.declines || [];
      activeDeclines.push(post.id);

      await supabase
        .from('posts')
        .update({ declines: activeDeclines })
        .eq('user_id', user.user_id)
        .eq('active', true);

      setActivePost({...activePost, declines: activeDeclines});
      setCurrentPostIndex(currentPostIndex + 1);
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        {activePost && posts?.length && posts.length !== currentPostIndex ? (
          !activePost?.requests?.includes(posts[currentPostIndex].id.toString()) &&
          !activePost?.declines?.includes(posts[currentPostIndex].id.toString()) ? (
            <Animated.View
              key={posts[currentPostIndex].id}
              style={{
                ...styles.postContainer,
                opacity: fadeAnim,
              }}
            >
            <Text style={styles.postName}>{posts[currentPostIndex].profiles.name}</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: posts[currentPostIndex].photo }} style={styles.postImage} />
              <TouchableOpacity style={styles.declineButton} onPress={() => {
                handleDecline(posts[currentPostIndex]);
              }}>
                <Icon name="window-close" size={24} color="#000" />
              </TouchableOpacity>
              {activePost?.requests && activePost?.requests?.includes(posts[currentPostIndex].id.toString()) ? (
                <View style={styles.heartButton}>
                  <Icon name="emoticon-wink" size={24} color="#FF5A5F" />
                </View>
              ) : (
                <TouchableOpacity style={styles.heartButton} onPress={() => handleRequest(posts[currentPostIndex])}>
                  <Icon name="emoticon-happy-outline" size={24} color="#FF5A5F" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.postDetails}>
              <View style={styles.attributes}>
                <View style={styles.borderRightDetail}>
                  <Text style={styles.postDetail}>
                    <Icon name="cake-variant-outline" size={18} color="#000000" /> {posts[currentPostIndex].profiles.age}
                  </Text>
                </View>
                <Text style={styles.postDetail}>
                  <Icon name="ruler" size={18} color="#000000" /> {posts[currentPostIndex].profiles.height.replace(/"{2}$/g, '"')}
                </Text>
              </View>
              <Text style={styles.postBio}>{posts[currentPostIndex].profiles.details}</Text>
              <View style={styles.interestsContainer}>
                {posts[currentPostIndex]?.profiles.interests &&
                  posts[currentPostIndex]?.profiles.interests.split(',').map((interest) => (
                    <Text style={styles.interest} key={interest}>
                      {interest}
                    </Text>
                  ))}
              </View>
            </View>
          </Animated.View>
          ) : (
            <View>
              <Text style={styles.titleNone}>No more posts available.</Text> 
            </View>
          )
      ) : (
        <View>
          {activePost || posts.length === 0 ? (
            <Text style={styles.titleNone}>No posts available.</Text> 
          ) : (
            <Text style={styles.titleNone}>Post to see who's available :)</Text> 
          )}
        </View>
      )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  declineButton: {
    backgroundColor: 'white',
    padding: 10,
    position: 'absolute',
    bottom: 10,
    left: 10,
    borderRadius: 50,
    zIndex: 1,
},
  titleNone: {
    textAlign: 'left',
    fontSize: 22,
    fontFamily: 'Georgia',
    marginTop: '2%',
},
  postBio: {
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
  },
  postDetails: {
    borderRadius: 10,
    backgroundColor:'white',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
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
  container: {
    flex: 1,
    paddingTop: '15%',
    paddingHorizontal: 20,
  },
  postContainer: {
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  postImage: {
    width: '100%',
    height: 500,
  },
  attributes: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 20,
  },
  postName: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postDetail: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 20,
  },
  borderRightDetail: {
    borderRightColor: '#000',
    borderRightWidth: 1,
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
});

export default PostFeed;
