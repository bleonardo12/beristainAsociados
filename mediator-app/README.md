# conflictiVOS

App de mediación de conflictos con IA para Android e iOS.

## Características

- 💬 Chat con límites saludables (280 caracteres, 2 mensajes consecutivos)
- 🤖 IA mediadora con sugerencias en tiempo real (Claude API)
- 🌡️ Termómetro visual del estado del conflicto
- 👥 Sistema de invitaciones para iniciar mediaciones
- 📊 Análisis de sentimiento y puntos de acuerdo

## Tecnologías

- React Native + Expo
- Claude API (Anthropic)
- AsyncStorage para persistencia local

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios
```

## Configuración

1. Obtén una API key en [console.anthropic.com](https://console.anthropic.com)
2. Crea un archivo `.env`:
```
CLAUDE_API_KEY=tu_api_key_aqui
```

3. Configura Google Sign-In:
   - Crea un proyecto en Google Cloud Console
   - Habilita Google Sign-In API
   - Configura las credenciales OAuth

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── Thermometer.js
│   ├── ChatBubble.js
│   ├── MessageInput.js
│   └── AISuggestionsPanel.js
├── screens/          # Pantallas
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── ChatScreen.js
│   └── ...
├── contexts/         # Estado global
│   ├── AuthContext.js
│   └── MediationContext.js
├── services/         # Servicios externos
│   └── aiService.js
├── navigation/       # Navegación
└── utils/            # Utilidades y constantes
```

## Modelo Freemium

**Gratis:**
- 3 sesiones/mes
- 50 mensajes/sesión
- 10 sugerencias IA/sesión

**Premium:**
- Sesiones ilimitadas
- Mensajes ilimitados
- Sugerencias ilimitadas
- Acceso a mediador humano

## Licencia

MIT
