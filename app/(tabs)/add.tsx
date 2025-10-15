import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, X, Check } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { getOrCreateDeviceId } from '@/lib/supabase';
import * as db from '@/lib/db';
import { useRouter } from 'expo-router';

export default function AddItemScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const [unidadOrganica, setUnidadOrganica] = useState('');
  const [cargo, setCargo] = useState('');
  const [usuarioField, setUsuarioField] = useState('');

  const skuCode = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPhotoUri(photo.uri);
          setShowCamera(false);
        }
      } catch (error: any) {
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del item es requerido');
      return;
    }

    setLoading(true);

    try {
      const deviceId = await getOrCreateDeviceId();

      const newItem = await db.insertItem({
        qr_code: skuCode,
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        location: location.trim(),
        quantity: parseInt(quantity) || 1,
        photo_url: photoUri,
        user_id: deviceId,
      });

      if (!newItem) throw new Error('No se pudo guardar el item');

      Alert.alert('Éxito', 'Item agregado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setDescription('');
            setCategory('');
            setLocation('');
            setQuantity('1');
            setPhotoUri(null);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (showCamera) {
    if (!permission) {
      return (
        <SafeAreaView style={styles.container}>
          <Text>Cargando cámara...</Text>
        </SafeAreaView>
      );
    }

    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Necesitamos permiso para acceder a la cámara
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <X size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <View style={styles.cameraButton} />
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Registrar Inventario</Text>
        </View>

        <View style={styles.qrContainer}>
          <Text style={styles.sectionTitle}>
            Código de Inventario generado:
          </Text>
          <View style={styles.qrCode}>
            <QRCode value={skuCode} size={150} />
          </View>
          <Text style={styles.qrText}>{skuCode}</Text>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Foto del Donativo:</Text>
          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhotoUri(null)}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cameraButtonLarge}
              onPress={() => setShowCamera(true)}
            >
              <Camera size={32} color="#E53935" />
              <Text style={styles.cameraButtonText}>
                Tomar foto del donativo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre del artículo donado"
            placeholderTextColor="#8E8E93"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción detallada"
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Categoría</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Ej: Ropa, Alimentos, Juguetes"
            placeholderTextColor="#8E8E93"
          />

          <Text style={styles.label}>Ubicación</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ej: Almacén A, Estante 3"
            placeholderTextColor="#8E8E93"
          />

          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            placeholderTextColor="#8E8E93"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Registrar Inventario'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  qrCode: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  qrText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonLarge: {
    backgroundColor: '#F2F2F7',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E53935',
    borderStyle: 'dashed',
  },
  cameraButtonText: {
    fontSize: 16,
    color: '#E53935',
    marginTop: 8,
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#E53935',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cameraButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E53935',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionText: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
