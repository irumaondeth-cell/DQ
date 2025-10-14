import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Package } from 'lucide-react-native';
import { supabase, InventoryItem } from '@/lib/supabase';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;

    setScanned(true);
    setShowCamera(false);

    try {
      if (!supabase) {
        Alert.alert('Configuración requerida', 'Conecta Supabase para escanear y buscar items.');
        setScanned(false);
        return;
      }
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('qr_code', data)
        .maybeSingle();

      if (error) throw error;

      if (items) {
        setScannedItem(items);
      } else {
        Alert.alert('No encontrado', 'No se encontró ningún item con este SKU');
        setScanned(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setScanned(false);
    }
  }

  function resetScanner() {
    setScanned(false);
    setScannedItem(null);
    setShowCamera(false);
  }

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
          <Package size={64} color="#8E8E93" />
          <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear códigos QR
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (scannedItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Item Encontrado</Text>
          <TouchableOpacity onPress={resetScanner}>
            <X size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.resultContent}>
          {scannedItem.photo_url && (
            <Image source={{ uri: scannedItem.photo_url }} style={styles.resultImage} />
          )}

          <View style={styles.resultCard}>
            <Text style={styles.resultName}>{scannedItem.name}</Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>SKU:</Text>
              <Text style={styles.resultValue}>{scannedItem.qr_code}</Text>
            </View>

            {scannedItem.description && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Descripción:</Text>
                <Text style={styles.resultValue}>{scannedItem.description}</Text>
              </View>
            )}

            {scannedItem.category && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Categoría:</Text>
                <Text style={styles.resultValue}>{scannedItem.category}</Text>
              </View>
            )}

            {scannedItem.location && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Ubicación:</Text>
                <Text style={styles.resultValue}>{scannedItem.location}</Text>
              </View>
            )}

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Cantidad:</Text>
              <Text style={styles.resultValue}>{scannedItem.quantity}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Agregado:</Text>
              <Text style={styles.resultValue}>
                {new Date(scannedItem.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
            <Text style={styles.scanAgainButtonText}>Escanear Otro QR</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarCodeScanned}>
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              <Text style={styles.instructionText}>Apunta al código SKU/QR</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCamera(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear SKU</Text>
      </View>

      <View style={styles.startContainer}>
        <Package size={80} color="#007AFF" />
        <Text style={styles.startTitle}>Escanear Código SKU/QR</Text>
        <Text style={styles.startText}>
          Escanea el SKU (o QR del SKU) de un item para ver su información completa
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={() => setShowCamera(true)}>
          <Text style={styles.startButtonText}>Iniciar Escaneo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  startText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContent: {
    padding: 16,
  },
  resultImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  resultRow: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    color: '#000000',
  },
  scanAgainButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
