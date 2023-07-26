import React, { useState, useEffect } from 'react';
import User from './components/User';
import AuthStack from './components/AuthStack';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './context/UserContext';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './components/LoadingScreen';

const App = () => {
  const [auth, setAuth] = useState<Object | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        if (!error) {
          setAuth(data);
        } else {
          console.error('Error recovering session:', error);
        }
      }
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
      </UserProvider>
    </NavigationContainer>
  );
};

export default App;
