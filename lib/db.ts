import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured, getOrCreateDeviceId } from './supabase';

export type InventoryItem = {
  id: string;
  qr_code: string;
  name: string;
  description: string;
  photo_url: string | null;
  quantity: number;
  category: string;
  location: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type LocalUser = {
  username: string;
  password: string;
  role: 'admin' | 'user';
};

const LOCAL_ITEMS_KEY = 'local_inventory_items_v1';
const LOCAL_USERS_KEY = 'local_users_v1';
const LOCAL_SESSION_KEY = 'local_session_v1';

function generateId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const isLocalMode = !isSupabaseConfigured;

// Simple pub/sub for auth state in local mode
const authListeners = new Set<(event: string, session: any) => void>();
function notifyAuth(event: string, session: any) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      // ignore
    }
  });
}

async function ensureDefaultAdmin(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
    const users = raw ? (JSON.parse(raw) as LocalUser[]) : [];
    const hasAdmin = users.some((u) => u.role === 'admin');
    if (!hasAdmin) {
      const admin: LocalUser = { username: 'administrador', password: '123456789', role: 'admin' };
      users.push(admin);
      await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
  } catch (e) {
    // ignore
  }
}

export async function loadUsers(): Promise<LocalUser[]> {
  if (supabase) {
    // If using Supabase, you should implement a users endpoint. For now, return empty array.
    return [];
  }

  await ensureDefaultAdmin();

  try {
    const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const users = JSON.parse(raw) as LocalUser[];
    return users;
  } catch (e) {
    return [];
  }
}

export async function createUserAdmin(username: string, password: string, role: 'admin' | 'user' = 'user') {
  if (supabase) {
    // Replace with real Supabase user creation if desired
    throw new Error('Create user via Supabase not implemented');
  }

  try {
    const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
    const users = raw ? (JSON.parse(raw) as LocalUser[]) : [];
    if (users.find((u) => u.username === username)) throw new Error('El usuario ya existe');
    const newUser: LocalUser = { username, password, role };
    users.push(newUser);
    await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e: any) {
    throw e;
  }
}

export async function loadItems(): Promise<InventoryItem[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as InventoryItem[];
  }

  try {
    const raw = await AsyncStorage.getItem(LOCAL_ITEMS_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as InventoryItem[];
    return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  } catch (e) {
    return [];
  }
}

export async function insertItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  if (supabase) {
    const deviceId = (await getOrCreateDeviceId()) || 'unknown';
    const payload = {
      qr_code: item.qr_code,
      name: item.name,
      description: item.description,
      category: item.category,
      location: item.location,
      quantity: item.quantity ?? 1,
      photo_url: item.photo_url ?? null,
      user_id: item.user_id ?? deviceId,
    } as any;
    const { data, error } = await supabase.from('inventory_items').insert(payload).select().maybeSingle();
    if (error) throw error;
    return (data as InventoryItem) ?? (payload as InventoryItem);
  }

  const deviceId = (await getOrCreateDeviceId()) || 'local';
  const now = new Date().toISOString();
  const newItem: InventoryItem = {
    id: generateId(),
    qr_code: item.qr_code ?? `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: item.name ?? '',
    description: item.description ?? '',
    photo_url: item.photo_url ?? null,
    quantity: item.quantity ?? 1,
    category: item.category ?? '',
    location: item.location ?? '',
    created_at: now,
    updated_at: now,
    user_id: item.user_id ?? deviceId,
  };

  try {
    const raw = await AsyncStorage.getItem(LOCAL_ITEMS_KEY);
    const arr = raw ? (JSON.parse(raw) as InventoryItem[]) : [];
    arr.unshift(newItem);
    await AsyncStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(arr));
    return newItem;
  } catch (e) {
    throw new Error('No se pudo guardar el item localmente');
  }
}

export async function deleteItem(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  try {
    const raw = await AsyncStorage.getItem(LOCAL_ITEMS_KEY);
    const arr = raw ? (JSON.parse(raw) as InventoryItem[]) : [];
    const filtered = arr.filter((i) => i.id !== id);
    await AsyncStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(filtered));
  } catch (e) {
    throw new Error('No se pudo eliminar el item localmente');
  }
}

export async function findBySKU(sku: string): Promise<InventoryItem | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('qr_code', sku)
      .maybeSingle();
    if (error) throw error;
    return (data as InventoryItem) ?? null;
  }

  try {
    const raw = await AsyncStorage.getItem(LOCAL_ITEMS_KEY);
    const arr = raw ? (JSON.parse(raw) as InventoryItem[]) : [];
    const found = arr.find((i) => i.qr_code === sku);
    return found ?? null;
  } catch (e) {
    return null;
  }
}

// --- Auth emulation for local mode ---
export async function signUp(username: string, password: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signUp({ email: username, password });
    if (error) throw error;
    return;
  }

  try {
    const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
    const users = raw ? (JSON.parse(raw) as LocalUser[]) : [];
    if (users.find((u) => u.username === username)) throw new Error('El usuario ya existe');
    users.push({ username, password, role: 'user' });
    await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e: any) {
    throw e;
  }
}

export async function signIn(username: string, password: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) throw error;
    return;
  }

  try {
    await ensureDefaultAdmin();
    const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
    const users = raw ? (JSON.parse(raw) as LocalUser[]) : [];
    const found = users.find((u) => u.username === username && u.password === password);
    if (!found) throw new Error('Credenciales inválidas');
    await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { username: found.username, role: found.role } }));
    notifyAuth('SIGNED_IN', { session: { user: { username: found.username, role: found.role } } });
  } catch (e: any) {
    throw e;
  }
}

export async function signOut(): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return;
  }

  try {
    await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
    notifyAuth('SIGNED_OUT', { session: null });
  } catch (e) {
    // ignore
  }
}

export async function getSession(): Promise<{ session: any } | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    return data ?? null;
  }

  try {
    const raw = await AsyncStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return { session: null };
    const session = JSON.parse(raw);
    return { session };
  } catch (e) {
    return { session: null };
  }
}

export function onAuthStateChange(cb: (event: string, session: any) => void) {
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(_event, session));
    return () => data.subscription.unsubscribe();
  }

  authListeners.add(cb);
  return () => authListeners.delete(cb);
}
