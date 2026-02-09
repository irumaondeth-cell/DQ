import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { getOrCreateDeviceId } from '@/lib/supabase';
import * as db from '@/lib/db';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet } from 'react-native';

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

  const LOGO_URL = 'https://cdn.builder.io/api/v1/image/assets%2Fbc935e2524ea4945a77bead3b9a7fa28%2F8f238af9f0574f569b6230b3aa443192?format=webp&width=800';

  if (!loggedIn) {
    return (
      <>
        <SafeAreaView style={styles.headerWrapper}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
        </SafeAreaView>
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
      <SafeAreaView style={styles.headerWrapper}>
        <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
      </SafeAreaView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  logo: {
    width: 160,
    height: 48,
  },
});
