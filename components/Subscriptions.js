import React, {useEffect, useState, useContext} from 'react';
import UserContext from '../context/UserContext';
import {View, FlatList, Alert, StyleSheet, Text, ActivityIndicator, TouchableOpacity, ScrollView, Modal} from 'react-native';
import Purchases from 'react-native-purchases';
import PackageItem from '../components/PackageItem';
import { supabase } from '../supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Subscriptions = ({navigation}) => {
  const [packages, setPackages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { user, setUser } = useContext(UserContext);

  // - State for displaying an overlay view
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    // Get current available packages
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length !== 0
        ) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        Alert.alert('Error getting offers', e.message);
      }
    };

    getPackages();
  }, []);

  const checkIfRowExists = async (deviceToken, subscriptionValue) => {
    try {
      // Send a select query to the Supabase table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .filter('deviceToken', 'eq', deviceToken)
        .filter('subscriptionType', 'eq', subscriptionValue)
        .not('user_id', 'eq', user?.user_id);

      if (error) {
        console.error('Error fetching data:', error);
        return false; // Handle the error as needed
      }

      // If data exists, the row with the specified device_token and subscription value exists
      if (data && data.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking if row exists:', error);
      return false; // Handle the error as needed
    }
  };

  const header = () => <Text style={[styles.text, styles.header]}>Subscribe to Chize Premium:</Text>;


  const footer = () => {
    return (
      <>
      <View style={styles.footerUpgrades}>
          <Text style={styles.footerTitle}>What you get...</Text>
          <Text>- Unlimited posts</Text>
          <Text>- Post before you go</Text>
          <Text>- See places that are happening</Text>
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity
            style={styles.pillButton}
            onPress={async () => {
              const rowExists = await checkIfRowExists(user?.deviceToken, 'premium');
              if (!rowExists) {
                try {
                  const restore = await Purchases.restorePurchases();
                  if (typeof restore?.entitlements.active.chizepremium !== 'undefined') {
                    navigation.navigate('ProfileDetails');
                    await supabase
                    .from('profiles')
                    .update({
                      subscriptionType: 'premium',
                    })
                    .eq('user_id', user.user_id)
                    .select();
                    setUser({
                      ...user,
                      subscriptionType: 'premium',
                    });
                  } else {
                    setUser({
                      ...user,
                      subscriptionType: null,
                    });
                    await supabase
                    .from('profiles')
                    .update({
                      subscriptionType: null,
                    })
                    .eq('user_id', user.user_id)
                    .select();
                  }
                } catch (e) {
                  console.log(e.message);
                }
              } else {
                Alert.alert('This device already has a subscription for another account');
              }
            }}
        >
          <Text style={[styles.text, styles.restore]}>Restore Purchase</Text>
        </TouchableOpacity>
      </View>
      </>
    );
  };


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
      <View style={styles.backArrowContainer}>
      </View>
      {/* The paywall flat list displaying each package */}
      <FlatList
        data={packages}
        renderItem={({ item }) => <PackageItem purchasePackage={item} setIsPurchasing={setIsPurchasing} />}
        keyExtractor={(item) => item.identifier}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styles.headerFooterContainer}
        ListFooterComponent={footer}
        ListFooterComponentStyle={styles.headerFooterContainer}
      />
      {isPurchasing && <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
      </View>}
      <View style={styles.center}>
        <TouchableOpacity
            style={styles.delete}
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <Text style={[styles.text, styles.terms]}>Terms and Conditions</Text>
        </TouchableOpacity>
      </View>


      <Modal visible={modalVisible} animationType="slide">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.close} onPress={() => {
                        setModalVisible(false);
                    }} >
                        <Icon name="window-close" size={28} color="#000000" />
                    </TouchableOpacity>
        <View style={styles.termsConditions}>
        <Text style={styles.heading}>
            Terms and Conditions for Chize Subscription Service
        </Text>

        <Text style={styles.updatedDate}>
            Last Updated: September 9, 2023
        </Text>

        <Text style={styles.paragraph}>
            Please read these <Text style={styles.boldText}>Terms and Conditions</Text> ("Terms") carefully before using the <Text style={styles.boldText}>Chize</Text> mobile application (the "App") operated by <Text style={styles.boldText}>Chize LLC</Text> ("us," "we," or "our").
        </Text>

        <Text style={styles.paragraph}>
            By accessing or using the App's subscription service ("<Text style={styles.boldText}>Service</Text>"), you agree to be bound by these Terms. If you disagree with any part of these Terms, do not use the Service.
        </Text>

        <Text style={styles.sectionHeading}>1. Subscription Overview</Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>1.1.</Text> The Service allows users to access premium features, content, or functionality within the App, subject to the payment of a subscription fee.
        </Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>1.2.</Text> Subscriptions may be offered on a monthly, annual, or other basis, as determined by us.
        </Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>1.3.</Text> Subscriptions automatically renew unless canceled by the user at least 24 hours before the end of the current subscription period. Payment will be charged to your Apple ID account upon confirmation of purchase.
        </Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>1.4.</Text> Subscription fees are non-refundable, and any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription.
        </Text>

        <Text style={styles.sectionHeading}>2. Billing and Payments</Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>2.1.</Text> When you subscribe to the Service, you agree to pay the applicable subscription fee as specified in the App.
        </Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>2.2.</Text> Your subscription will be charged to your Apple ID account upon confirmation of purchase.
        </Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>2.3.</Text> You can manage and cancel your subscription by going to your Apple ID Account Settings after purchase.
        </Text>

        <Text style={styles.sectionHeading}>3. Privacy Policy</Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>3.1.</Text> Your use of the Service is also governed by our Privacy Policy, which can be found at 
            <Text
                style={styles.linkText}
                onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Settings');
                }}
            >
                Privacy Policy
            </Text>. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.
        </Text>

        <Text style={styles.sectionHeading}>4. Termination</Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>4.1.</Text> We reserve the right to suspend or terminate your subscription and access to the Service without notice if you breach these Terms.
        </Text>

        <Text style={styles.sectionHeading}>5. Changes to Terms</Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>5.1.</Text> We may update these Terms at any time, and the updated version will be effective immediately upon posting. You are responsible for reviewing these Terms regularly.
        </Text>

        <Text style={styles.sectionHeading}>6. Contact Us</Text>

        <Text style={styles.paragraph}>
            <Text style={styles.boldText}>6.1.</Text> If you have any questions about these Terms or the Service, please contact us at feedback@chizeapp.com.
        </Text>

        <Text style={styles.paragraph}>
            By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
        </Text>
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
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    opacity: 0.6,
  },
  close: {
    position: 'absolute',
    right: 20,
    top:60,
    zIndex: 1,
},
termsConditions: {
  paddingTop: 40,
},
  modalContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
},
  footerUpgrades: {
    marginVertical: 10,
  },
  footerTitle: {
    marginBottom: 5,
    fontSize: 21,
    fontFamily: 'Georgia',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    width: '100%',
  },
  updatedDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subsectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    marginLeft: 16,
  },
  footerContainer: {
    flexDirection: 'column', // Align items vertically
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  center: {
    textAlign: 'center',
  },
    delete: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
    },
    restore: {
      textAlign: 'center',
    },
    pillButton: {
      borderColor: '#000000',
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 15,
      marginHorizontal: 20,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    terms: {
      marginTop: 26,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    header: {
      fontSize: 16,
      marginBottom: 5,
      textAlign: 'center',
    },
    page: {
      flex: 1,
      paddingTop: '15%',
      alignContent: 'center',
      paddingHorizontal: 20,
    },
    text: {
      color: 'black',
    },
    headerFooterContainer: {
      marginVertical: 10,
    },
    overlay: {
      flex: 1,
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      opacity: 0.5,
      backgroundColor: 'black',
    },
  });

export default Subscriptions;
