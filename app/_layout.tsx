import { useEffect, useState } from 'react';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { getOrCreateDeviceId } from '@/lib/supabase';
import * as db from '@/lib/db';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function init() {
      const session = await db.getSession();
      setLoggedIn(Boolean(session && session.session));
      setLoadingAuth(false);

      unsub = db.onAuthStateChange((_event, session) => {
        setLoggedIn(Boolean(session && session.session));
      });
    }

    init();
    return () => unsub && unsub();
  }, []);

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
