import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as db from '@/lib/db';
import { useRouter, useSearchParams } from 'expo-router';
import { InventoryItem } from '@/lib/supabase';

export default function UsuariosScreen() {
  const [users, setUsers] = useState<Array<any>>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (params.user) {
      setSelectedUser(String(params.user));
      loadItemsForUser(String(params.user));
    }
  }, [params.user]);

  async function loadUsers() {
    try {
      const u = await db.loadUsers();
      setUsers(u);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  async function loadItemsForUser(username: string) {
    try {
      const all = await db.loadItems();
      const filtered = all.filter(
        (i) => (i.usuario && i.usuario === username) || i.user_id === username,
      );
      setItems(filtered);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  function renderUser({ item }: { item: any }) {
    return (
      <View style={styles.userRow}>
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.meta}>
            {item.unidad_organica || '-'} · {item.cargo || '-'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setSelectedUser(item.username);
              loadItemsForUser(item.username);
            }}
            style={styles.viewBtn}
          >
            <Text style={styles.viewBtnText}>Ver registros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push(`/admin?user=${item.username}`);
            }}
            style={styles.viewBtnAlt}
          >
            <Text style={styles.viewBtnAltText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderItem({ item }: { item: InventoryItem }) {
    return (
      <View style={styles.itemRow}>
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={styles.thumb} />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>
            Código: {item.qr_code} · Cant: {item.quantity}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usuarios y Registros</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.usersList}>
          <Text style={styles.sectionTitle}>Usuarios</Text>
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(u) => u.username}
          />
        </View>
        <View style={styles.itemsList}>
          <Text style={styles.sectionTitle}>
            Registros {selectedUser ? `de ${selectedUser}` : ''}
          </Text>
          {items.length === 0 ? (
            <Text style={{ color: '#666', marginTop: 12 }}>
              No hay registros para este usuario
            </Text>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(i) => i.id}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  content: { flex: 1, flexDirection: 'row' },
  usersList: {
    width: 320,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
    backgroundColor: '#FFF',
  },
  itemsList: { flex: 1, padding: 12 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  userRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: { fontWeight: '700' },
  meta: { color: '#666' },
  viewBtn: { backgroundColor: '#E53935', padding: 8, borderRadius: 8 },
  viewBtnText: { color: '#FFF' },
  viewBtnAlt: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewBtnAltText: { color: '#333' },
  itemRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12 },
  itemName: { fontWeight: '700' },
  itemMeta: { color: '#666' },
});
