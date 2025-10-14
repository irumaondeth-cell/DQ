Guía de despliegue — bolt-expo-starter

Resumen rápido

Este proyecto es una app Expo (React Native + Expo Router). Se puede ejecutar localmente, desplegar como web estática o compilar para móviles con EAS. La app soporta dos modos:
- Modo local (por defecto si NO existen las variables EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY): los datos y usuarios se almacenan en AsyncStorage.
- Modo Supabase: si defines EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY la app usará Supabase para auth y datos.

Credenciales admin local (modo local)
- Email: admin@local
- Contraseña: 123456789
- El admin puede crear otros usuarios desde la sección "Admin".

1) Preparar antes de desplegar (requisitos)
- Node 18+ y npm o pnpm/ni (el proyecto indica "ni" como setup).
- Expo CLI (opcional): npm install -g expo-cli
- (Para builds nativos) Expo Application Services (EAS): npm install -g eas-cli
- Git remoto configurado (repo donde empujarás los cambios)

2) Variables de entorno importantes
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

Si vas a usar Supabase en producción crea un proyecto en Supabase y configura estas variables en el host de destino (Netlify/Vercel/EAS/Host).
Para conectar desde Builder.io o desde la plataforma del proyecto usa: [Connect to Supabase](#open-mcp-popover).

3) Despliegue web (Netlify / Vercel / GitHub Pages)
Opción A — Netlify (recomendado para sitios estáticos):
- En build command usa: npm run build:web
- Public directory: web-build (si usas expo export) o la carpeta que genere la exportación
- Configura las variables EXPO_PUBLIC_* en el panel de environment variables de Netlify
- Push a la rama remota o arrastra el build a Netlify

Opción B — Vercel:
- Conecta el repo y configura el comando de build: npm run build:web
- Configura las variables de entorno en Settings > Environment Variables

Opción C — Host propio / Docker:
- Ejecuta: npm run build:web
- Sube el contenido generado a tu servidor estático o contenedor

4) Despliegue móvil (iOS / Android)
- Configura EAS: eas login, eas build:configure
- Para builds nativas (recomendado): eas build --platform all
- Para publicar OTA (sin recompilar): expo publish (o EAS Update para EAS-managed)
- Configura variables de entorno para producción en EAS (eas.json/env de tu host) o en el dashboard del servicio de build

5) Recomendaciones de seguridad y producción
- No dejar credenciales en el código. Usa variables de entorno en el host.
- En modo local las contraseñas se almacenan en texto (AsyncStorage) — está pensado para desarrollo. Para producción usa Supabase u otro backend.
- Considera añadir HTTPS y políticas CORS correctas en tu backend (Supabase lo maneja por ti).

6) Cómo migrar datos locales a Supabase (cuando lo conectes)
- Implementar exportación sencilla: leer AsyncStorage LOCAL_ITEMS_KEY y POSTear a un endpoint de servidor o insertarlos con supabase.from('inventory_items').insert(...)
- Puedes extender code/lib/db.ts para añadir una función syncLocalToSupabase() que haga esto.

7) Conexiones útiles (MCP integraciones) — sugerencias para esta app
Cuando te convenga, conecta estas integraciones desde la plataforma:
- Supabase — Base de datos + autenticación en producción. (Usos: auth, almacenamiento, realtime). [Connect to Supabase](#open-mcp-popover)
- Neon — Alternativa a Supabase para Postgres serverless. [Connect to Neon](#open-mcp-popover)
- Netlify — Hosting para la versión web estática. [Connect to Netlify](#open-mcp-popover)
- Zapier — Automatizaciones y workflows (envío de notificaciones, sync). [Connect to Zapier](#open-mcp-popover)
- Figma — Si necesitas convertir diseños a código usa el plugin de Builder.io para Figma. (No traer URLs directamente). Get plugin: https://www.figma.com/community/plugin/747985167520967365/builder-io-ai-powered-figma-to-code-react-vue-tailwind-more
- Builder CMS — Si quieres gestionar contenido (textos, assets) desde un CMS. [Connect to Builder.io](#open-mcp-popover)
- Linear — Gestión de issues y tareas. [Connect to Linear](#open-mcp-popover)
- Notion — Documentación y knowledge base. [Connect to Notion](#open-mcp-popover)
- Sentry — Monitoring y reportes de errores (muy útil en producción). [Connect to Sentry](#open-mcp-popover)
- Context7 — Acceso a documentación técnica (APIs, libs). [Connect to Context7](#open-mcp-popover)
- Semgrep — Escaneo de seguridad del código. [Connect to Semgrep](#open-mcp-popover)
- Prisma Postgres — Si prefieres un ORM para Postgres en backend. [Connect to Prisma](#open-mcp-popover)

(Observación: Prefiere Supabase para DB/autenticación. Conecta MCPs desde la UI: [Open MCP popover](#open-mcp-popover)).

8) Pasos mínimos para publicar desde este repo (ejemplo: Netlify)
- Confirmar que todo compila: npm run dev (local)
- Generar build web: npm run build:web
- Commit & Push a la rama remota
- En Netlify: conectar el repo y seleccionar rama -> configurar build command -> configurar variables de entorno -> deploy

9) Comandos útiles
- npm run dev — correr en modo desarrollo
- npm run build:web — exportar versión web
- eas build --platform all — compilar nativo con EAS
- expo publish — publicar OTA (no recomendado para builds nativos en producción sin revisar)

10) Soporte post-despliegue
- Si adoptas Supabase, crea la tabla inventory_items con el schema esperado; las columnas incluyen: id, qr_code, name, description, photo_url, quantity, category, location, created_at, updated_at, user_id
- Si quieres, puedo generar un script SQL para crear la tabla en Supabase.

---
Notas finales
- He incluido la administración de usuarios en modo local (admin seed: admin@local / 123456789). Para producción crea usuarios reales en Supabase y elimina privilegios en la app si fuera necesario.
- Si quieres que cree el script SQL para Supabase o que agregue syncLocalToSupabase, dime y lo añado.
