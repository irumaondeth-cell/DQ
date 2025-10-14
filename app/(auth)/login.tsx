import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function handleAuth() {
    if (!supabase) {
      Alert.alert('Configuración requerida', 'Conecta Supabase para iniciar sesión.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Error', 'Ingresa email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Cuenta creada', 'Revisa tu correo si se requiere confirmación.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#8E8E93"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#8E8E93"
        />
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.link}>{mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7', padding: 16 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#000' },
  input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, fontSize: 16, color: '#000', marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 12, fontWeight: '600' },
});
