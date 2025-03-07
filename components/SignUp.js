import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { supabase } from '../supabase';
import Toast from 'react-native-toast-message';

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [retypePasswordError, setRetypePasswordError] = useState('');

  const handleFormSubmit = async () => {
    // Reset the error messages
    setEmailError('');
    setPasswordError('');
    setRetypePasswordError('');

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

    if (password !== retypePassword) {
      setRetypePasswordError('Passwords do not match');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setPasswordError(error.message);
      }

      if (data) {
        navigation.navigate('SignIn', {verEmail: email, verPassword: password});
        Toast.show({
          type: 'success',
          text1: 'Email Verification!',
          text2: 'Email was sent to your email!',
        });
      }

      if (error) {
        console.error(error);
        return;
      }
    } catch (e) {
      console.error('Error creating user:', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      <Text style={styles.label}>Re-type password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        value={retypePassword}
        onChangeText={(text) => setRetypePassword(text)}
      />
      {retypePasswordError ? (
        <Text style={styles.errorText}>{retypePasswordError}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleFormSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createButton}
        title="Create an Account"
        onPress={() => {
          navigation.navigate('SignIn');
        }}
      >
        <Text style={styles.createButtonText}>Already have an account?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingTop: 30,
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
  title: {
    textAlign: 'center',
    fontSize: 25,
    marginVertical: 20,
    fontWeight: 400,
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignUp;
