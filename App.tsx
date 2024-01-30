import React, { useState, useEffect } from 'react';
import User from './components/User';
import AuthStack from './components/AuthStack';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './context/UserContext';
import Purchases from 'react-native-purchases';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './components/LoadingScreen';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const App = () => {
  const [auth, setAuth] = useState<Object | null>(null);
  const [loading, setLoading] = useState(true);

  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'white' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          color: 'green',
          fontWeight: '400'
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        text1Style={{
          color: 'red'
        }}
      />
    ),
  };

  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    const handleAuthToken = async (token: string, reftoken: string) => {
      if (token && reftoken) {
        await AsyncStorage.setItem('supabase-token', token);
        await AsyncStorage.setItem('supabase-reftoken', reftoken);
      } else {
        setAuth(null);
        await AsyncStorage.removeItem('supabase-token');
        await AsyncStorage.removeItem('supabase-reftoken');
      }
    };

    const restoreUserSession = async () => {
      const token = await AsyncStorage.getItem('supabase-token');
      const refToken = await AsyncStorage.getItem('supabase-reftoken');
      if (token !== null && refToken !== null) {
        const { data, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: refToken,
        });
        if (!error && data) {
          setAuth(data);
        } else {
          console.error('Error recovering session:', error);
        }
      }

      Purchases.configure({ apiKey: 'appl_mdnPUFUocMUddvRrWykXSbtMvOh', appUserID: null, observerMode: false, useAmazon: false });
    };

    restoreUserSession().then(() => {
      setLoading(false); // Set loading to false once the user session is restored
    });

    restoreUserSession();

    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuth(session);
        handleAuthToken(session.access_token, session.refresh_token);
      } else {
        handleAuthToken('', '');
      }
    });
  }, []);

  if (loading) {
    // Render the LoadingScreen while loading is true
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
        <UserProvider>
          {auth ? <User session={auth} /> : <AuthStack />}
          <Toast config={toastConfig} />
        </UserProvider>
    </NavigationContainer>
  );
};

export default App;
