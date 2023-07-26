import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { REACT_NATIVE_SUPABASE_KEY, REACT_NATIVE_SUPABASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(REACT_NATIVE_SUPABASE_URL, REACT_NATIVE_SUPABASE_KEY, {
    localStorage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
});
