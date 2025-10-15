import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import * as db from '@/lib/db';

export default function AdminScreen() {
  const [users, setUsers] = useState<Array<{ username: string; role: string; unidad_organica?: string | null; cargo?: string | null }>>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [unidadOrg, setUnidadOrg] = useState('');
  const [cargoField, setCargoField] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const u = await db.loadUsers();
      setUsers(u.map((x) => ({ username: x.username, role: x.role })));
    } catch (e:any) {
      Alert.alert('Error', e.message);
    }
  }

  async function handleCreate() {
    if (!username || !password) {
      Alert.alert('Error', 'Usuario y contraseña son requeridos');
      return;
    }
    setLoading(true);
    try {
      await db.createUserAdmin(username.trim(), password, role, unidadOrg.trim() || null, cargoField.trim() || null);
      setUsername('');
      setPassword('');
      setRole('user');
      loadUsers();
      Alert.alert('Éxito', 'Usuario creado');
    } catch (e:any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }: { item: { username: string; role: string } }) => (
    <View key={item.username} style={styles.userRow}>
      <Text style={styles.userEmail}>{item.username}</Text>
      <Text style={styles.userRole}>{item.role}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Administrar Usuarios</Text>
        <Text style={styles.label}>Crear nuevo usuario</Text>
        <TextInput style={styles.input} placeholder="Usuario" value={username} onChangeText={setUsername} placeholderTextColor="#8E8E93" />
        <TextInput style={styles.input} placeholder="Contraseña" value={password} secureTextEntry onChangeText={setPassword} placeholderTextColor="#8E8E93" />
        <TextInput style={styles.input} placeholder="Unidad Orgánica" value={unidadOrg} onChangeText={setUnidadOrg} placeholderTextColor="#8E8E93" />
        <TextInput style={styles.input} placeholder="Cargo" value={cargoField} onChangeText={setCargoField} placeholderTextColor="#8E8E93" />
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} onPress={() => setRole('user')}>
            <Text style={role === 'user' ? styles.roleTextActive : styles.roleText}>Usuario</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]} onPress={() => setRole('admin')}>
            <Text style={role === 'admin' ? styles.roleTextActive : styles.roleText}>Admin</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creando…' : 'Crear Usuario'}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 16 }]}>Usuarios existentes</Text>
        <FlatList data={users} renderItem={renderItem} keyExtractor={(i, idx) => (i.username ?? String(idx))} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, marginTop: 8, color: '#000' },
  roleBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA', marginRight: 8 },
  roleBtnActive: { backgroundColor: '#E53935' },
  roleText: { color: '#000' },
  roleTextActive: { color: '#FFF', fontWeight: '700' },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFF', fontWeight: '700' },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  userEmail: { color: '#000' },
  userRole: { color: '#666', fontWeight: '600' },
});
