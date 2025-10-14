import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      if (!isSupabaseConfigured || !supabase) {
        setLoadingAuth(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setLoggedIn(Boolean(data.session));
      setLoadingAuth(false);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setLoggedIn(Boolean(session));
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    }

    init();
    return () => {
      unsubscribe?.();
    };
  }, []);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <SafeAreaView>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Configuración requerida</Text>
          <Text style={{ color: '#555' }}>
            Para usar la app, configura las variables de entorno EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.
          </Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  if (loadingAuth) {
    return (
      <SafeAreaView>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18 }}>Cargando…</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
