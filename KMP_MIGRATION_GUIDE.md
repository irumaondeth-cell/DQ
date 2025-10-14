# Guía Completa: Migración a Kotlin Multiplatform (Android + Desktop)

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración Inicial](#configuración-inicial)
4. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
5. [Código de Implementación](#código-de-implementación)
6. [Integración con Supabase](#integración-con-supabase)
7. [Ejecución del Proyecto](#ejecución-del-proyecto)

---

## 📦 Requisitos Previos

### Software Necesario
- **IntelliJ IDEA** (Community o Ultimate) o **Android Studio** (Hedgehog 2023.1.1+)
- **JDK 17** o superior
- **Android SDK** (API 21+ para compatibilidad con Android 5.0+)
- **Gradle 8.0+** (se instala automáticamente)

### Conocimientos Recomendados
- Kotlin básico/intermedio
- Compose Multiplatform (similar a Jetpack Compose)
- Arquitectura MVVM
- Conceptos de coroutines y Flow

---

## 🏗️ Estructura del Proyecto

```
InventoryAppKMP/
├── composeApp/                    # Código compartido
│   └── src/
│       ├── commonMain/           # Código común (Android + Desktop)
│       │   ├── kotlin/
│       │   │   └── com.inventory.app/
│       │   │       ├── App.kt
│       │   │       ├── di/           # Dependency Injection
│       │   │       │   └── AppModule.kt
│       │   │       ├── data/
│       │   │       │   ├── model/
│       │   │       │   │   └── InventoryItem.kt
│       │   │       │   ├── repository/
│       │   │       │   │   └── InventoryRepository.kt
│       │   │       │   └── source/
│       │   │       │       └── SupabaseDataSource.kt
│       │   │       ├── domain/
│       │   │       │   ├── usecase/
│       │   │       │   │   ├── GetItemsUseCase.kt
│       │   │       │   │   ├── AddItemUseCase.kt
│       │   │       │   │   ├── DeleteItemUseCase.kt
│       │   │       │   │   └── ScanQRUseCase.kt
│       │   │       │   └── model/
│       │   │       │       └── ItemDomain.kt
│       │   │       ├── presentation/
│       │   │       │   ├── screens/
│       │   │       │   │   ├── home/
│       │   │       │   │   │   ├── HomeScreen.kt
│       │   │       │   │   │   └── HomeViewModel.kt
│       │   │       │   │   ├── add/
│       │   │       │   │   │   ├── AddItemScreen.kt
│       │   │       │   │   │   └── AddItemViewModel.kt
│       │   │       │   │   └── scanner/
│       │   │       │   │       ├── ScannerScreen.kt
│       │   │       │   │       └── ScannerViewModel.kt
│       │   │       │   ├── navigation/
│       │   │       │   │   └── Navigation.kt
│       │   │       │   └── components/
│       │   │       │       ├── ItemCard.kt
│       │   │       │       ├── SearchBar.kt
│       │   │       │       └── QRCodeGenerator.kt
│       │   │       └── util/
│       │   │           ├── Constants.kt
│       │   │           └── Extensions.kt
│       │   └── resources/         # Recursos compartidos
│       │       └── drawable/
│       ├── androidMain/           # Código específico de Android
│       │   └── kotlin/
│       │       └── com.inventory.app/
│       │           ├── platform/
│       │           │   ├── CameraCapture.android.kt
│       │           │   └── QRScanner.android.kt
│       │           └── MainActivity.kt
│       └── desktopMain/          # Código específico de Desktop
│           └── kotlin/
│               └── com.inventory.app/
│                   ├── platform/
│                   │   ├── CameraCapture.desktop.kt
│                   │   └── QRScanner.desktop.kt
│                   └── main.kt
├── gradle/
│   └── libs.versions.toml        # Catálogo de versiones
├── build.gradle.kts              # Configuración raíz
├── settings.gradle.kts
└── gradle.properties
```

---

## ⚙️ Configuración Inicial

### 1. Crear Proyecto en IntelliJ IDEA

1. Abre IntelliJ IDEA
2. File → New → Project
3. Selecciona **Kotlin Multiplatform**
4. Project name: `InventoryAppKMP`
5. Marca las plataformas: **Android** y **Desktop (JVM)**
6. Click en **Create**

### 2. Configuración de `gradle/libs.versions.toml`

```toml
[versions]
kotlin = "2.0.20"
compose = "1.7.0"
agp = "8.2.2"
androidx-activityCompose = "1.9.2"
kotlinx-coroutines = "1.9.0"
ktor = "3.0.0"
kotlinx-serialization = "1.7.3"
kotlinx-datetime = "0.6.1"
supabase = "3.0.0"
zxing = "3.5.3"
coil = "3.0.0-alpha10"

[libraries]
androidx-activity-compose = { module = "androidx.activity:activity-compose", version.ref = "androidx-activityCompose" }
kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "kotlinx-coroutines" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }
kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }

# Ktor para networking
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
ktor-client-cio = { module = "io.ktor:ktor-client-cio", version.ref = "ktor" }
ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }

# Supabase
supabase-postgrest-kt = { module = "io.github.jan-tennert.supabase:postgrest-kt", version.ref = "supabase" }
supabase-storage-kt = { module = "io.github.jan-tennert.supabase:storage-kt", version.ref = "supabase" }
supabase-realtime-kt = { module = "io.github.jan-tennert.supabase:realtime-kt", version.ref = "supabase" }

# QR Code
zxing-core = { module = "com.google.zxing:core", version.ref = "zxing" }
zxing-android = { module = "com.google.zxing:android-core", version.ref = "zxing" }

# Image loading
coil-compose = { module = "io.coil-kt.coil3:coil-compose", version.ref = "coil" }
coil-network-ktor = { module = "io.coil-kt.coil3:coil-network-ktor", version.ref = "coil" }

[plugins]
androidApplication = { id = "com.android.application", version.ref = "agp" }
kotlinMultiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
composeMultiplatform = { id = "org.jetbrains.compose", version.ref = "compose" }
composeCompiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
```

### 3. Configuración de `build.gradle.kts` (raíz del proyecto)

```kotlin
plugins {
    alias(libs.plugins.kotlinMultiplatform) apply false
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.composeMultiplatform) apply false
    alias(libs.plugins.composeCompiler) apply false
    alias(libs.plugins.kotlinSerialization) apply false
}
```

### 4. Configuración de `composeApp/build.gradle.kts`

```kotlin
import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    androidTarget {
        @OptIn(ExperimentalKotlinGradlePluginApi::class)
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_17)
        }
    }

    jvm("desktop")

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation(compose.ui)
                implementation(compose.components.resources)
                implementation(compose.components.uiToolingPreview)

                // Coroutines
                implementation(libs.kotlinx.coroutines.core)

                // Serialization
                implementation(libs.kotlinx.serialization.json)
                implementation(libs.kotlinx.datetime)

                // Ktor Client
                implementation(libs.ktor.client.core)
                implementation(libs.ktor.client.content.negotiation)
                implementation(libs.ktor.serialization.kotlinx.json)

                // Supabase
                implementation(libs.supabase.postgrest.kt)
                implementation(libs.supabase.storage.kt)

                // QR Code
                implementation(libs.zxing.core)

                // Image Loading
                implementation(libs.coil.compose)
                implementation(libs.coil.network.ktor)
            }
        }

        val androidMain by getting {
            dependencies {
                implementation(libs.androidx.activity.compose)
                implementation(libs.kotlinx.coroutines.android)
                implementation(libs.ktor.client.cio)
                implementation(libs.zxing.android)

                // CameraX para captura de fotos
                implementation("androidx.camera:camera-camera2:1.3.4")
                implementation("androidx.camera:camera-lifecycle:1.3.4")
                implementation("androidx.camera:camera-view:1.3.4")

                // ML Kit para escaneo QR
                implementation("com.google.mlkit:barcode-scanning:17.3.0")
            }
        }

        val desktopMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
                implementation(libs.ktor.client.cio)
                implementation(libs.kotlinx.coroutines.core)
            }
        }
    }
}

android {
    namespace = "com.inventory.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.inventory.app"
        minSdk = 21  // Android 5.0 (Lollipop)
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

compose.desktop {
    application {
        mainClass = "com.inventory.app.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageName = "com.inventory.app"
            packageVersion = "1.0.0"

            windows {
                iconFile.set(project.file("src/commonMain/resources/icon.ico"))
            }
            linux {
                iconFile.set(project.file("src/commonMain/resources/icon.png"))
            }
        }
    }
}
```

### 5. Configuración de `gradle.properties`

```properties
kotlin.code.style=official
kotlin.mpp.stability.nowarn=true
kotlin.mpp.enableCInteropCommonization=true

android.useAndroidX=true
android.nonTransitiveRClass=true

org.gradle.jvmargs=-Xmx2048M -Dfile.encoding=UTF-8 -Dkotlin.daemon.jvm.options=-Xmx2048M
```

---

## 🏛️ Arquitectura de la Aplicación

### Clean Architecture con MVVM

```
Presentation Layer (UI + ViewModel)
        ↓
Domain Layer (Use Cases)
        ↓
Data Layer (Repository + Data Source)
        ↓
External Services (Supabase API)
```

### Flujo de Datos

1. **UI** dispara un evento → **ViewModel**
2. **ViewModel** llama a **Use Case**
3. **Use Case** ejecuta lógica de negocio y llama a **Repository**
4. **Repository** obtiene datos de **Supabase Data Source**
5. Los datos fluyen de vuelta como **Flow/State**

---

## 💻 Código de Implementación

### 1. Modelos de Datos

#### `data/model/InventoryItem.kt`

```kotlin
package com.inventory.app.data.model

import kotlinx.datetime.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class InventoryItem(
    @SerialName("id")
    val id: String,

    @SerialName("qr_code")
    val qrCode: String,

    @SerialName("name")
    val name: String,

    @SerialName("description")
    val description: String? = null,

    @SerialName("photo_url")
    val photoUrl: String? = null,

    @SerialName("quantity")
    val quantity: Int = 1,

    @SerialName("category")
    val category: String? = null,

    @SerialName("location")
    val location: String? = null,

    @SerialName("created_at")
    val createdAt: Instant,

    @SerialName("updated_at")
    val updatedAt: Instant,

    @SerialName("user_id")
    val userId: String?
)
```

#### `data/model/CreateItemRequest.kt`

```kotlin
package com.inventory.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CreateItemRequest(
    @SerialName("qr_code")
    val qrCode: String,

    @SerialName("name")
    val name: String,

    @SerialName("description")
    val description: String = "",

    @SerialName("photo_url")
    val photoUrl: String? = null,

    @SerialName("quantity")
    val quantity: Int = 1,

    @SerialName("category")
    val category: String = "",

    @SerialName("location")
    val location: String = "",

    @SerialName("user_id")
    val userId: String? = null
)
```

### 2. Configuración de Supabase

#### `data/source/SupabaseClient.kt`

```kotlin
package com.inventory.app.data.source

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage

object SupabaseClient {
    val client = createSupabaseClient(
        supabaseUrl = "https://utnyqlqkmgiolpopnipk.supabase.co",
        supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bnlxbHFrbWdpb2xwb3BuaXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjUxMTQsImV4cCI6MjA3NTYwMTExNH0.J7BrOck9Se8WlCq7M6B0UbKlADm8zhebJf7QYkQViEQ"
    ) {
        install(Postgrest)
        install(Storage)
    }
}
```

#### `data/source/SupabaseDataSource.kt`

```kotlin
package com.inventory.app.data.source

import com.inventory.app.data.model.CreateItemRequest
import com.inventory.app.data.model.InventoryItem
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SupabaseDataSource {
    private val client = SupabaseClient.client

    suspend fun getAllItems(): List<InventoryItem> = withContext(Dispatchers.Default) {
        try {
            client.from("inventory_items")
                .select()
                .decodeList<InventoryItem>()
        } catch (e: Exception) {
            println("Error fetching items: ${e.message}")
            emptyList()
        }
    }

    suspend fun getItemByQRCode(qrCode: String): InventoryItem? = withContext(Dispatchers.Default) {
        try {
            client.from("inventory_items")
                .select {
                    filter {
                        eq("qr_code", qrCode)
                    }
                }
                .decodeSingleOrNull<InventoryItem>()
        } catch (e: Exception) {
            println("Error fetching item by QR: ${e.message}")
            null
        }
    }

    suspend fun insertItem(item: CreateItemRequest): InventoryItem? = withContext(Dispatchers.Default) {
        try {
            client.from("inventory_items")
                .insert(item)
                .decodeSingle<InventoryItem>()
        } catch (e: Exception) {
            println("Error inserting item: ${e.message}")
            null
        }
    }

    suspend fun deleteItem(id: String): Boolean = withContext(Dispatchers.Default) {
        try {
            client.from("inventory_items")
                .delete {
                    filter {
                        eq("id", id)
                    }
                }
            true
        } catch (e: Exception) {
            println("Error deleting item: ${e.message}")
            false
        }
    }

    suspend fun searchItems(query: String): List<InventoryItem> = withContext(Dispatchers.Default) {
        try {
            client.from("inventory_items")
                .select {
                    filter {
                        or {
                            ilike("name", "%$query%")
                            ilike("category", "%$query%")
                            ilike("qr_code", "%$query%")
                        }
                    }
                }
                .decodeList<InventoryItem>()
        } catch (e: Exception) {
            println("Error searching items: ${e.message}")
            emptyList()
        }
    }
}
```

### 3. Repository

#### `data/repository/InventoryRepository.kt`

```kotlin
package com.inventory.app.data.repository

import com.inventory.app.data.model.CreateItemRequest
import com.inventory.app.data.model.InventoryItem
import com.inventory.app.data.source.SupabaseDataSource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class InventoryRepository(
    private val dataSource: SupabaseDataSource = SupabaseDataSource()
) {

    fun getAllItems(): Flow<Result<List<InventoryItem>>> = flow {
        try {
            val items = dataSource.getAllItems()
            emit(Result.success(items))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    fun getItemByQRCode(qrCode: String): Flow<Result<InventoryItem?>> = flow {
        try {
            val item = dataSource.getItemByQRCode(qrCode)
            emit(Result.success(item))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    fun addItem(item: CreateItemRequest): Flow<Result<InventoryItem>> = flow {
        try {
            val newItem = dataSource.insertItem(item)
            if (newItem != null) {
                emit(Result.success(newItem))
            } else {
                emit(Result.failure(Exception("Failed to create item")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    fun deleteItem(id: String): Flow<Result<Boolean>> = flow {
        try {
            val success = dataSource.deleteItem(id)
            emit(Result.success(success))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    fun searchItems(query: String): Flow<Result<List<InventoryItem>>> = flow {
        try {
            val items = dataSource.searchItems(query)
            emit(Result.success(items))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
}
```

### 4. Use Cases

#### `domain/usecase/GetItemsUseCase.kt`

```kotlin
package com.inventory.app.domain.usecase

import com.inventory.app.data.model.InventoryItem
import com.inventory.app.data.repository.InventoryRepository
import kotlinx.coroutines.flow.Flow

class GetItemsUseCase(
    private val repository: InventoryRepository
) {
    operator fun invoke(): Flow<Result<List<InventoryItem>>> {
        return repository.getAllItems()
    }
}
```

#### `domain/usecase/AddItemUseCase.kt`

```kotlin
package com.inventory.app.domain.usecase

import com.inventory.app.data.model.CreateItemRequest
import com.inventory.app.data.model.InventoryItem
import com.inventory.app.data.repository.InventoryRepository
import kotlinx.coroutines.flow.Flow

class AddItemUseCase(
    private val repository: InventoryRepository
) {
    operator fun invoke(
        qrCode: String,
        name: String,
        description: String = "",
        photoUrl: String? = null,
        quantity: Int = 1,
        category: String = "",
        location: String = ""
    ): Flow<Result<InventoryItem>> {
        val request = CreateItemRequest(
            qrCode = qrCode,
            name = name,
            description = description,
            photoUrl = photoUrl,
            quantity = quantity,
            category = category,
            location = location,
            userId = null
        )
        return repository.addItem(request)
    }
}
```

#### `domain/usecase/DeleteItemUseCase.kt`

```kotlin
package com.inventory.app.domain.usecase

import com.inventory.app.data.repository.InventoryRepository
import kotlinx.coroutines.flow.Flow

class DeleteItemUseCase(
    private val repository: InventoryRepository
) {
    operator fun invoke(itemId: String): Flow<Result<Boolean>> {
        return repository.deleteItem(itemId)
    }
}
```

#### `domain/usecase/ScanQRUseCase.kt`

```kotlin
package com.inventory.app.domain.usecase

import com.inventory.app.data.model.InventoryItem
import com.inventory.app.data.repository.InventoryRepository
import kotlinx.coroutines.flow.Flow

class ScanQRUseCase(
    private val repository: InventoryRepository
) {
    operator fun invoke(qrCode: String): Flow<Result<InventoryItem?>> {
        return repository.getItemByQRCode(qrCode)
    }
}
```

### 5. ViewModels

#### `presentation/screens/home/HomeViewModel.kt`

```kotlin
package com.inventory.app.presentation.screens.home

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.inventory.app.data.model.InventoryItem
import com.inventory.app.data.repository.InventoryRepository
import com.inventory.app.domain.usecase.DeleteItemUseCase
import com.inventory.app.domain.usecase.GetItemsUseCase
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {
    private val repository = InventoryRepository()
    private val getItemsUseCase = GetItemsUseCase(repository)
    private val deleteItemUseCase = DeleteItemUseCase(repository)

    var uiState by mutableStateOf(HomeUiState())
        private set

    init {
        loadItems()
    }

    fun loadItems() {
        uiState = uiState.copy(isLoading = true, error = null)

        getItemsUseCase()
            .onEach { result ->
                result.fold(
                    onSuccess = { items ->
                        uiState = uiState.copy(
                            items = items,
                            filteredItems = items,
                            isLoading = false
                        )
                    },
                    onFailure = { error ->
                        uiState = uiState.copy(
                            isLoading = false,
                            error = error.message ?: "Error desconocido"
                        )
                    }
                )
            }
            .launchIn(viewModelScope)
    }

    fun searchItems(query: String) {
        uiState = uiState.copy(searchQuery = query)

        if (query.isBlank()) {
            uiState = uiState.copy(filteredItems = uiState.items)
            return
        }

        val filtered = uiState.items.filter {
            it.name.contains(query, ignoreCase = true) ||
            it.category?.contains(query, ignoreCase = true) == true ||
            it.qrCode.contains(query, ignoreCase = true)
        }

        uiState = uiState.copy(filteredItems = filtered)
    }

    fun deleteItem(itemId: String) {
        viewModelScope.launch {
            deleteItemUseCase(itemId)
                .onEach { result ->
                    result.fold(
                        onSuccess = { success ->
                            if (success) {
                                loadItems()
                            }
                        },
                        onFailure = { error ->
                            uiState = uiState.copy(
                                error = error.message ?: "Error al eliminar"
                            )
                        }
                    )
                }
                .launchIn(viewModelScope)
        }
    }

    fun clearError() {
        uiState = uiState.copy(error = null)
    }
}

data class HomeUiState(
    val items: List<InventoryItem> = emptyList(),
    val filteredItems: List<InventoryItem> = emptyList(),
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
)
```

#### `presentation/screens/add/AddItemViewModel.kt`

```kotlin
package com.inventory.app.presentation.screens.add

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.inventory.app.data.repository.InventoryRepository
import com.inventory.app.domain.usecase.AddItemUseCase
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import java.util.UUID

class AddItemViewModel : ViewModel() {
    private val repository = InventoryRepository()
    private val addItemUseCase = AddItemUseCase(repository)

    var uiState by mutableStateOf(AddItemUiState())
        private set

    init {
        generateQRCode()
    }

    fun updateName(name: String) {
        uiState = uiState.copy(name = name)
    }

    fun updateDescription(description: String) {
        uiState = uiState.copy(description = description)
    }

    fun updateCategory(category: String) {
        uiState = uiState.copy(category = category)
    }

    fun updateLocation(location: String) {
        uiState = uiState.copy(location = location)
    }

    fun updateQuantity(quantity: String) {
        quantity.toIntOrNull()?.let {
            if (it > 0) {
                uiState = uiState.copy(quantity = it)
            }
        }
    }

    fun updatePhotoUrl(url: String?) {
        uiState = uiState.copy(photoUrl = url)
    }

    fun generateQRCode() {
        val qrCode = "INV-${UUID.randomUUID().toString().take(8).uppercase()}"
        uiState = uiState.copy(qrCode = qrCode)
    }

    fun saveItem(onSuccess: () -> Unit) {
        if (uiState.name.isBlank()) {
            uiState = uiState.copy(error = "El nombre es requerido")
            return
        }

        uiState = uiState.copy(isLoading = true, error = null)

        addItemUseCase(
            qrCode = uiState.qrCode,
            name = uiState.name,
            description = uiState.description,
            photoUrl = uiState.photoUrl,
            quantity = uiState.quantity,
            category = uiState.category,
            location = uiState.location
        )
            .onEach { result ->
                result.fold(
                    onSuccess = {
                        uiState = uiState.copy(
                            isLoading = false,
                            success = true
                        )
                        onSuccess()
                    },
                    onFailure = { error ->
                        uiState = uiState.copy(
                            isLoading = false,
                            error = error.message ?: "Error al guardar"
                        )
                    }
                )
            }
            .launchIn(viewModelScope)
    }

    fun clearError() {
        uiState = uiState.copy(error = null)
    }

    fun resetForm() {
        uiState = AddItemUiState()
        generateQRCode()
    }
}

data class AddItemUiState(
    val qrCode: String = "",
    val name: String = "",
    val description: String = "",
    val category: String = "",
    val location: String = "",
    val quantity: Int = 1,
    val photoUrl: String? = null,
    val isLoading: Boolean = false,
    val success: Boolean = false,
    val error: String? = null
)
```

### 6. Screens con Compose Multiplatform

#### `presentation/screens/home/HomeScreen.kt`

```kotlin
package com.inventory.app.presentation.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.inventory.app.data.model.InventoryItem
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = viewModel { HomeViewModel() }
) {
    val uiState = viewModel.uiState

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Inventario") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Bar
            SearchBar(
                query = uiState.searchQuery,
                onQueryChange = { viewModel.searchItems(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            )

            when {
                uiState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }

                uiState.error != null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = uiState.error,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }

                uiState.filteredItems.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No hay items en el inventario")
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.filteredItems) { item ->
                            ItemCard(
                                item = item,
                                onDelete = { viewModel.deleteItem(item.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        modifier = modifier,
        placeholder = { Text("Buscar por nombre, categoría o QR...") },
        leadingIcon = {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Buscar"
            )
        },
        singleLine = true,
        shape = RoundedCornerShape(12.dp)
    )
}

@Composable
fun ItemCard(
    item: InventoryItem,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                if (!item.description.isNullOrBlank()) {
                    Text(
                        text = item.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (!item.category.isNullOrBlank()) {
                        Chip(text = item.category)
                    }
                    if (!item.location.isNullOrBlank()) {
                        Chip(text = "📍 ${item.location}")
                    }
                    Chip(text = "Cantidad: ${item.quantity}")
                }

                Text(
                    text = "QR: ${item.qrCode}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            IconButton(onClick = onDelete) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Eliminar",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun Chip(text: String) {
    Text(
        text = text,
        modifier = Modifier
            .background(
                color = MaterialTheme.colorScheme.secondaryContainer,
                shape = RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 8.dp, vertical = 4.dp),
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSecondaryContainer
    )
}
```

#### `presentation/screens/add/AddItemScreen.kt`

```kotlin
package com.inventory.app.presentation.screens.add

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.inventory.app.presentation.components.QRCodeDisplay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddItemScreen(
    onNavigateBack: () -> Unit,
    viewModel: AddItemViewModel = viewModel { AddItemViewModel() }
) {
    val uiState = viewModel.uiState

    LaunchedEffect(uiState.success) {
        if (uiState.success) {
            onNavigateBack()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Agregar Item") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // QR Code Display
            QRCodeDisplay(
                qrCode = uiState.qrCode,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )

            // Form Fields
            OutlinedTextField(
                value = uiState.name,
                onValueChange = { viewModel.updateName(it) },
                label = { Text("Nombre *") },
                modifier = Modifier.fillMaxWidth(),
                isError = uiState.error != null && uiState.name.isBlank(),
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = uiState.description,
                onValueChange = { viewModel.updateDescription(it) },
                label = { Text("Descripción") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = uiState.category,
                onValueChange = { viewModel.updateCategory(it) },
                label = { Text("Categoría") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = uiState.location,
                onValueChange = { viewModel.updateLocation(it) },
                label = { Text("Ubicación") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = uiState.quantity.toString(),
                onValueChange = { viewModel.updateQuantity(it) },
                label = { Text("Cantidad") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            // Error Message
            if (uiState.error != null) {
                Text(
                    text = uiState.error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            // Save Button
            Button(
                onClick = { viewModel.saveItem(onNavigateBack) },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.isLoading,
                shape = RoundedCornerShape(12.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Guardar Item")
                }
            }
        }
    }
}
```

### 7. Componente QR Code

#### `presentation/components/QRCodeDisplay.kt`

```kotlin
package com.inventory.app.presentation.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import androidx.compose.ui.unit.dp
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import org.jetbrains.skia.Bitmap
import org.jetbrains.skia.ColorAlphaType
import org.jetbrains.skia.ImageInfo

@Composable
fun QRCodeDisplay(
    qrCode: String,
    modifier: Modifier = Modifier
) {
    val qrBitmap = remember(qrCode) {
        generateQRCode(qrCode)
    }

    Column(
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.surface,
                shape = RoundedCornerShape(16.dp)
            )
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Image(
            bitmap = qrBitmap,
            contentDescription = "QR Code",
            modifier = Modifier
                .size(200.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
                .padding(8.dp)
        )

        Text(
            text = qrCode,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

fun generateQRCode(content: String, size: Int = 512): ImageBitmap {
    val writer = QRCodeWriter()
    val hints = mapOf(EncodeHintType.MARGIN to 1)

    val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size, hints)

    val width = bitMatrix.width
    val height = bitMatrix.height
    val pixels = IntArray(width * height)

    for (y in 0 until height) {
        for (x in 0 until width) {
            pixels[y * width + x] = if (bitMatrix[x, y]) {
                0xFF000000.toInt() // Black
            } else {
                0xFFFFFFFF.toInt() // White
            }
        }
    }

    val bitmap = Bitmap().apply {
        allocPixels(ImageInfo.makeN32(width, height, ColorAlphaType.PREMUL))
        installPixels(pixels)
    }

    return bitmap.toComposeImageBitmap()
}
```

### 8. Navigation

#### `presentation/navigation/Navigation.kt`

```kotlin
package com.inventory.app.presentation.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.inventory.app.presentation.screens.add.AddItemScreen
import com.inventory.app.presentation.screens.home.HomeScreen
import com.inventory.app.presentation.screens.scanner.ScannerScreen

@Composable
fun AppNavigation() {
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Inventario") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Add, contentDescription = "Agregar") },
                    label = { Text("Agregar") },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Search, contentDescription = "Escanear") },
                    label = { Text("Escanear") },
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (selectedTab) {
                0 -> HomeScreen()
                1 -> AddItemScreen(onNavigateBack = { selectedTab = 0 })
                2 -> ScannerScreen()
            }
        }
    }
}
```

### 9. App Principal

#### `App.kt` (commonMain)

```kotlin
package com.inventory.app

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import com.inventory.app.presentation.navigation.AppNavigation

@Composable
fun App() {
    MaterialTheme {
        AppNavigation()
    }
}
```

#### `MainActivity.kt` (androidMain)

```kotlin
package com.inventory.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            App()
        }
    }
}

@Preview
@Composable
fun AppAndroidPreview() {
    App()
}
```

#### `main.kt` (desktopMain)

```kotlin
package com.inventory.app

import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "Inventory App"
    ) {
        App()
    }
}
```

---

## 🔧 Integración con Supabase

### Estado Actual de la Base de Datos

Tu base de datos Supabase ya tiene la tabla `inventory_items` con la siguiente estructura:

```sql
CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  photo_url text,
  quantity integer DEFAULT 1,
  category text DEFAULT '',
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid
);
```

### RLS (Row Level Security)

**Nota importante:** En el proyecto actual, `user_id` puede ser `NULL` porque no hay autenticación. Las políticas RLS están configuradas pero no se aplican sin usuarios autenticados.

Para desarrollo local sin autenticación:
- Puedes **deshabilitar temporalmente RLS** para testing
- O configurar políticas públicas para desarrollo

### Desactivar RLS para Testing (Temporal)

```sql
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
```

**IMPORTANTE:** Reactiva RLS antes de producción:

```sql
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Política pública para desarrollo (solo si no usas auth)
CREATE POLICY "Allow public access"
  ON inventory_items FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## ▶️ Ejecución del Proyecto

### Android

1. **Abrir proyecto en Android Studio:**
   ```bash
   cd InventoryAppKMP
   # Abrir la carpeta en Android Studio
   ```

2. **Sincronizar Gradle:**
   - Android Studio sincronizará automáticamente
   - Espera a que termine

3. **Configurar emulador o dispositivo:**
   - AVD Manager → Crear emulador (API 34 recomendado)
   - O conectar dispositivo físico con USB debugging

4. **Ejecutar:**
   - Click en Run (▶️)
   - Selecciona target: `composeApp`
   - La app se instalará y ejecutará

### Desktop (JVM)

1. **Desde terminal:**
   ```bash
   ./gradlew :composeApp:run
   ```

2. **Desde IntelliJ IDEA:**
   - Gradle panel → Tasks → compose desktop → run
   - O Run → Edit Configurations → Add Gradle task → `composeApp:run`

### Generar APK para Android

```bash
./gradlew :composeApp:assembleDebug
```

El APK estará en: `composeApp/build/outputs/apk/debug/`

### Generar ejecutable Desktop

```bash
./gradlew :composeApp:packageDistributionForCurrentOS
```

Los instaladores estarán en: `composeApp/build/compose/binaries/main/`

---

## 📸 Captura de Fotos (Platform-Specific)

### Android (CameraX)

#### `platform/CameraCapture.android.kt`

```kotlin
package com.inventory.app.platform

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat

@Composable
actual fun CameraCaptureButton(onPhotoTaken: (String?) -> Unit) {
    val context = LocalContext.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    Button(
        onClick = {
            if (hasCameraPermission) {
                // TODO: Implementar captura con CameraX
                onPhotoTaken(null)
            } else {
                launcher.launch(Manifest.permission.CAMERA)
            }
        }
    ) {
        Text(if (hasCameraPermission) "Tomar Foto" else "Permitir Cámara")
    }
}
```

### Desktop (File Chooser)

#### `platform/CameraCapture.desktop.kt`

```kotlin
package com.inventory.app.platform

import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import java.awt.FileDialog
import java.awt.Frame

@Composable
actual fun CameraCaptureButton(onPhotoTaken: (String?) -> Unit) {
    Button(
        onClick = {
            val fileDialog = FileDialog(null as Frame?, "Seleccionar imagen", FileDialog.LOAD)
            fileDialog.file = "*.jpg;*.png"
            fileDialog.isVisible = true
            val selectedFile = fileDialog.file
            if (selectedFile != null) {
                onPhotoTaken("${fileDialog.directory}$selectedFile")
            }
        }
    ) {
        Text("Seleccionar Imagen")
    }
}
```

#### Interface común: `platform/CameraCapture.kt` (commonMain)

```kotlin
package com.inventory.app.platform

import androidx.compose.runtime.Composable

@Composable
expect fun CameraCaptureButton(onPhotoTaken: (String?) -> Unit)
```

---

## 🔍 Escaneo QR (Platform-Specific)

### Android (ML Kit)

#### `platform/QRScanner.android.kt`

```kotlin
package com.inventory.app.platform

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

@Composable
actual fun QRScannerView(onQRScanned: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            launcher.launch(Manifest.permission.CAMERA)
        }
    }

    if (hasCameraPermission) {
        AndroidView(
            factory = { ctx ->
                val previewView = PreviewView(ctx)
                val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)

                cameraProviderFuture.addListener({
                    val cameraProvider = cameraProviderFuture.get()

                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                    val imageAnalysis = ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build()
                        .also {
                            it.setAnalyzer(Executors.newSingleThreadExecutor()) { imageProxy ->
                                val mediaImage = imageProxy.image
                                if (mediaImage != null) {
                                    val image = InputImage.fromMediaImage(
                                        mediaImage,
                                        imageProxy.imageInfo.rotationDegrees
                                    )

                                    val scanner = BarcodeScanning.getClient()
                                    scanner.process(image)
                                        .addOnSuccessListener { barcodes ->
                                            for (barcode in barcodes) {
                                                if (barcode.format == Barcode.FORMAT_QR_CODE) {
                                                    barcode.rawValue?.let { qrValue ->
                                                        onQRScanned(qrValue)
                                                    }
                                                }
                                            }
                                        }
                                        .addOnCompleteListener {
                                            imageProxy.close()
                                        }
                                }
                            }
                        }

                    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                    try {
                        cameraProvider.unbindAll()
                        cameraProvider.bindToLifecycle(
                            lifecycleOwner,
                            cameraSelector,
                            preview,
                            imageAnalysis
                        )
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }

                }, ContextCompat.getMainExecutor(ctx))

                previewView
            },
            modifier = Modifier.fillMaxSize()
        )
    } else {
        Column(modifier = Modifier.fillMaxSize()) {
            Text("Se requiere permiso de cámara")
            Button(onClick = { launcher.launch(Manifest.permission.CAMERA) }) {
                Text("Solicitar Permiso")
            }
        }
    }
}
```

### Desktop (Input Manual)

#### `platform/QRScanner.desktop.kt`

```kotlin
package com.inventory.app.platform

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
actual fun QRScannerView(onQRScanned: (String) -> Unit) {
    var qrInput by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Escaneo QR no disponible en Desktop")
        Spacer(modifier = Modifier.height(16.dp))
        Text("Ingresa el código manualmente:")
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = qrInput,
            onValueChange = { qrInput = it },
            label = { Text("Código QR") },
            modifier = Modifier.fillMaxWidth(0.5f)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                if (qrInput.isNotBlank()) {
                    onQRScanned(qrInput)
                    qrInput = ""
                }
            },
            enabled = qrInput.isNotBlank()
        ) {
            Text("Buscar")
        }
    }
}
```

#### Interface común: `platform/QRScanner.kt` (commonMain)

```kotlin
package com.inventory.app.platform

import androidx.compose.runtime.Composable

@Composable
expect fun QRScannerView(onQRScanned: (String) -> Unit)
```

### Screen de Scanner

#### `presentation/screens/scanner/ScannerScreen.kt`

```kotlin
package com.inventory.app.presentation.screens.scanner

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.inventory.app.platform.QRScannerView
import com.inventory.app.presentation.screens.home.ItemCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScannerScreen(
    viewModel: ScannerViewModel = viewModel { ScannerViewModel() }
) {
    val uiState = viewModel.uiState

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Escanear QR") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (uiState.scannedItem == null) {
                QRScannerView(onQRScanned = { qrCode ->
                    viewModel.scanQRCode(qrCode)
                })
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Item Encontrado",
                        style = MaterialTheme.typography.headlineMedium
                    )

                    ItemCard(
                        item = uiState.scannedItem,
                        onDelete = {}
                    )

                    Button(
                        onClick = { viewModel.reset() },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Escanear Otro")
                    }
                }
            }

            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            if (uiState.error != null) {
                Snackbar(
                    modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp),
                    action = {
                        TextButton(onClick = { viewModel.clearError() }) {
                            Text("OK")
                        }
                    }
                ) {
                    Text(uiState.error)
                }
            }
        }
    }
}
```

#### `presentation/screens/scanner/ScannerViewModel.kt`

```kotlin
package com.inventory.app.presentation.screens.scanner

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.inventory.app.data.model.InventoryItem
import com.inventory.app.data.repository.InventoryRepository
import com.inventory.app.domain.usecase.ScanQRUseCase
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

class ScannerViewModel : ViewModel() {
    private val repository = InventoryRepository()
    private val scanQRUseCase = ScanQRUseCase(repository)

    var uiState by mutableStateOf(ScannerUiState())
        private set

    fun scanQRCode(qrCode: String) {
        uiState = uiState.copy(isLoading = true, error = null)

        scanQRUseCase(qrCode)
            .onEach { result ->
                result.fold(
                    onSuccess = { item ->
                        if (item != null) {
                            uiState = uiState.copy(
                                scannedItem = item,
                                isLoading = false
                            )
                        } else {
                            uiState = uiState.copy(
                                isLoading = false,
                                error = "No se encontró ningún item con este QR"
                            )
                        }
                    },
                    onFailure = { error ->
                        uiState = uiState.copy(
                            isLoading = false,
                            error = error.message ?: "Error al escanear"
                        )
                    }
                )
            }
            .launchIn(viewModelScope)
    }

    fun reset() {
        uiState = ScannerUiState()
    }

    fun clearError() {
        uiState = uiState.copy(error = null)
    }
}

data class ScannerUiState(
    val scannedItem: InventoryItem? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)
```

---

## 🎯 Próximos Pasos

1. **Crear el proyecto** en IntelliJ IDEA/Android Studio siguiendo la estructura
2. **Copiar todo el código** proporcionado en los archivos correspondientes
3. **Sincronizar Gradle** y resolver dependencias
4. **Ejecutar en Android** primero para verificar funcionalidad básica
5. **Ejecutar en Desktop** para probar multiplataforma
6. **Implementar captura de fotos** completa con CameraX (Android)
7. **Agregar almacenamiento de imágenes** en Supabase Storage (opcional)
8. **Configurar autenticación** si decides agregar usuarios más adelante

---

## 📚 Recursos Adicionales

- [Kotlin Multiplatform Docs](https://kotlinlang.org/docs/multiplatform.html)
- [Compose Multiplatform Docs](https://www.jetbrains.com/lp/compose-multiplatform/)
- [Supabase Kotlin Client](https://github.com/supabase-community/supabase-kt)
- [ZXing Documentation](https://github.com/zxing/zxing)
- [ML Kit Barcode Scanning](https://developers.google.com/ml-kit/vision/barcode-scanning)

---

## ❓ Solución de Problemas

### Error: "Could not find method implementation()"

**Solución:** Verifica que estás usando `implementation()` dentro de `dependencies {}` en el bloque correcto de `sourceSets`.

### Error: "Unresolved reference: viewModel"

**Solución:** En KMP, necesitas usar una librería de ViewModel compatible. Considera usar `moko-mvvm` o implementar tu propio sistema de ViewModel simple.

### Error al compilar para Desktop

**Solución:** Asegúrate de tener JDK 17+ configurado correctamente:
```bash
./gradlew --version
# Debería mostrar Java 17+
```

### ML Kit no funciona en emulador

**Solución:** Usa un dispositivo físico o un emulador con Google Play Services instalado.

---

¡Tu proyecto Kotlin Multiplatform está listo para comenzar! 🎉
