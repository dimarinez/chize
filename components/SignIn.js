import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text, Linking, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase';

const SignIn = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');



  // // useEffect(() => {
  // //   Linking.addEventListener('url', handleDeepLink);

  // //   // // Clean up the event listener
  // //   // return () => {
  // //   //   Linking.removeEventListener('url', handleDeepLink);
  // //   // };
  // // }, []);

  const handleDeepLink = async (event) => {
    handleSigninSubmit(true);
  };

  Linking.addEventListener('url', handleDeepLink);

  const handleSigninSubmit = async (deeplink) => {
    // Reset the error messages
    setEmailError('');
    setPasswordError('');

    // Perform input validation
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError('Invalid email format');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (deeplink && data?.session) {
        await supabase.from('profiles').insert([
          {
            user_id: data.session.user.id,
          },
        ]);
        await supabase.rpc('add_user_role', {
          user_id: data.session.user.id,
          role: 'user',
        });
      }

      if (error) {
        setPasswordError(error.message);
      }
    } catch (e) {
      console.error('Error signing in:', e.message);
    }
  };

  useEffect(() => {
    if (route?.params?.verEmail && route?.params?.verPassword) {
      setEmail(route.params.verEmail);
      setPassword(route.params.verPassword);
    }
  }, [route?.params]);

  const handleEmailChange = text => {
    setEmail(text);
  };

  const handlePasswordChange = text => {
    setPassword(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry={true}
        onChangeText={handlePasswordChange}
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}


      <TouchableOpacity title="Sign In" style={styles.submitButton} onPress={handleSigninSubmit} color="#FF5A5F">
        <Text style={styles.submitButtonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createButton}
        title="Create an Account"
        onPress={() => {
          navigation.navigate('SignUp');
        }}
      >
        <Text style={styles.createButtonText}>Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    marginHorizontal: 20,
    marginTop: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    marginVertical: 20,
    fontWeight: 400,
  },
  createButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  createButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    textAlign: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    height: 45,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignIn;
