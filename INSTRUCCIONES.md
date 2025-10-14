# Aplicación de Inventario con QR

Aplicación móvil de inventario que permite gestionar items con códigos QR y fotografías.

## Compatibilidad Android

✅ **Compatible con Android 5.0 (Lollipop) y superior** - API Level 21+

Esto significa que la app funcionará en prácticamente todos los dispositivos Android modernos:
- Android 14 (2023)
- Android 13 (2022)
- Android 12 (2021)
- Android 11 (2020)
- Android 10 (2019)
- Android 9 (Pie)
- Android 8 (Oreo)
- Android 7 (Nougat)
- Android 6 (Marshmallow)
- Android 5 (Lollipop) - desde 2014

**Cobertura**: Más del 99% de dispositivos Android activos en 2025

## Opción 1: Ejecutar en Android Studio

### Requisitos previos
- Android Studio instalado
- Node.js y npm instalados
- Java Development Kit (JDK) instalado

### Pasos para ejecutar:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Generar archivos nativos de Android**:
   ```bash
   npx expo prebuild --platform android
   ```

   Este comando creará la carpeta `android/` con el proyecto nativo.

3. **Abrir en Android Studio**:
   - Abre Android Studio
   - Selecciona "Open an existing project"
   - Navega a la carpeta `android/` dentro del proyecto
   - Espera a que Android Studio sincronice los archivos Gradle

4. **Configurar emulador o dispositivo**:
   - Configura un emulador Android en Android Studio (recomendado: API 34), o
   - Conecta tu dispositivo Android físico con USB debugging activado

5. **Iniciar Metro Bundler**:
   ```bash
   npm run dev
   ```

6. **Ejecutar la app**:
   - En Android Studio, presiona el botón "Run" (▶️)
   - La app se instalará y ejecutará en tu emulador o dispositivo

### Notas importantes:
- La primera vez que ejecutes `prebuild`, se generará la carpeta `android/`
- Si agregas nuevos plugins nativos, debes ejecutar `prebuild` nuevamente
- Asegúrate de que Metro Bundler esté corriendo antes de ejecutar la app

## Opción 2: Usar en Expo Go (Desarrollo rápido)

1. **Instalar Expo Go** en tu dispositivo Android desde Google Play Store

2. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Escanear el código QR** que aparece en la terminal con la app Expo Go

**Nota**: Expo Go es ideal para desarrollo rápido y funciona en todos los dispositivos compatibles.

## Características

### 📦 Inventario
- Ver todos tus items
- Buscar por nombre, categoría o código QR
- Eliminar items

### ➕ Agregar Item
- Genera automáticamente un código QR único para cada item
- Toma foto del item con la cámara
- Campos disponibles:
  - Nombre (requerido)
  - Descripción
  - Categoría
  - Ubicación
  - Cantidad

### 🔍 Escanear QR
- Escanea códigos QR de items existentes
- Muestra toda la información del item escaneado
- Funciona con los códigos QR generados en la app

## Permisos

La app solicitará acceso a:
- **Cámara**: Para tomar fotos de los items y escanear códigos QR

## Notas Técnicas

- Compatible con Android 5.0+ (API 21+)
- Compatible con Android Studio y Expo Go
- Usa Supabase para almacenamiento de datos
- Los datos se identifican por dispositivo (no requiere autenticación)
- Cada dispositivo gestiona su propio inventario
- Configurado con permisos de cámara nativos
- New Architecture deshabilitada para mayor compatibilidad
