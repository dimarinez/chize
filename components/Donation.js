import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';

const DonationForm = () => {
  const { confirmPayment } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDonate = async () => {
    setIsProcessing(true);
    try {
      const { paymentIntent, error } = await confirmPayment({
        clientSecret: 'YOUR_PAYMENT_INTENT_CLIENT_SECRET', // Retrieve from your server
      });

      if (error) {
        console.log('Payment confirmation error:', error);
        // Handle error
      } else if (paymentIntent) {
        console.log('Payment confirmed:', paymentIntent);
        // Payment was successful
      }
    } catch (error) {
      console.log('Error confirming payment:', error);
      // Handle error
    }
    setIsProcessing(false);
  };

  return (
    <View>
      <CardField
        postalCodeEnabled={false}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
      />
      <Button
        title={isProcessing ? 'Processing...' : 'Donate'}
        onPress={handleDonate}
        disabled={isProcessing}
      />
    </View>
  );
};

export default DonationForm;
