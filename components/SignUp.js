import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { supabase } from '../supabase';

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
        console.log(data);
        await supabase.from('profiles').insert([
          {
            user_id: data.session.user.id,
          },
        ]);
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
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Re-type Password"
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
    fontSize: 20,
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
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
