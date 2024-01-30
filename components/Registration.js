import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';

const Registration = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <View style={styles.createUserContent}>
      <Text style={styles.title}>Chize</Text>
      <TouchableOpacity title="Sign In" style={styles.submitButton} onPress={() => {
        navigation.navigate('SignUp');
      }} color="#FF5A5F">
        <Text style={styles.submitButtonText}>Create an Account</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  createUserContent: {
    width: 340,
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Vertically center align children
    alignItems: 'center', // Horizontally center align children
  },
  title: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '900',
    marginVertical: 20,
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
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    borderColor: '#FF5A5F',
    borderWidth: 2,
    borderRadius: 50,
    marginTop: 10,
    padding: 20,
    marginBottom: 5,
  },
  input: {
    height: 40,
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

export default Registration;
