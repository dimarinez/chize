import React, { useContext, useEffect } from 'react';
import UserContext from '../context/UserContext';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import Purchases from 'react-native-purchases';
import { supabase } from '../supabase';

const PackageItem = ({ purchasePackage, setIsPurchasing }) => {
  const { user, setUser } = useContext(UserContext);
  const {
    product: { title, description, priceString },
  } = purchasePackage;

  useEffect(() => {
    setIsPurchasing(false);
  }, []);

  const checkIfRowExists = async (deviceToken, subscriptionValue) => {
    try {
      // Send a select query to the Supabase table
      const { data, error } = await supabase
        .from('profiles') // Replace 'your_table_name' with your actual table name
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

  const onSelection = async () => {
    const rowExists = await checkIfRowExists(user?.deviceToken, 'premium');
    setIsPurchasing(true);

    if (!rowExists) {
      try {
        const { purchaserInfo } = await Purchases.purchasePackage(purchasePackage);

        if (typeof purchaserInfo?.entitlements.active.chizepremium !== 'undefined') {
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
        }
      } catch (e) {
        if (!e.userCancelled) {
          Alert.alert('Error purchasing package', e.message);
        }
      } finally {
        const customerInfo = await Purchases.getCustomerInfo();

        if (!user?.subscriptionType && typeof customerInfo?.entitlements.active.chizepremium !== 'undefined') {
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
        }
        setIsPurchasing(false);
      }
    } else {
      setIsPurchasing(false);
      Alert.alert('This device already has a subscription for another account');
    }
  };

  return (
    <Pressable onPress={onSelection} style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.terms}>{description}</Text>
      </View>
      <Text style={styles.title}>{priceString}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 25,
      backgroundColor: '#1a1a1a',
      borderBottomWidth: 1,
      borderRadius: 50,
      borderBottomColor: '#242424',
    },
    title: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    terms: {
      color: 'darkgrey',
    },
});


export default PackageItem;