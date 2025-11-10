# Área de Socios - Sistema de Presupuestos

## 📋 Descripción

Sistema de acceso protegido para socios del estudio jurídico, que permite gestionar presupuestos de manera privada y segura.

## 🔐 Características de Seguridad

### Autenticación
- Página de login protegida con contraseña (`login.html`)
- Contraseña por defecto: `BeristainSocios2025`
- Protección contra fuerza bruta: máximo 5 intentos fallidos
- Bloqueo temporal de 5 minutos después de exceder los intentos
- Sesión almacenada en `sessionStorage` (se cierra al cerrar el navegador)

### Protección de Acceso
- La página de presupuestos verifica automáticamente la autenticación
- Redirección automática al login si no está autenticado
- Botón de cerrar sesión para salir del área privada

## 📱 Páginas Creadas

### 1. login.html
**Ubicación:** `/frontend/login.html`

**Características:**
- Diseño moderno y responsive
- Campo de contraseña con opción para mostrar/ocultar
- Protección contra intentos excesivos (5 intentos máximo)
- Bloqueo temporal después de intentos fallidos
- Mensajes de error informativos
- Enlace para volver al inicio

**Acceso desde el sitio:**
- Clic en el botón "Socios" en la barra de navegación

### 2. presupuestos.html
**Ubicación:** `/frontend/presupuestos.html`

**Características:**
- Dashboard con estadísticas (total, pendientes, aprobados)
- Listado de presupuestos en tabla
- Formulario para crear nuevos presupuestos
- Gestión de presupuestos (agregar, eliminar)
- Estados de presupuesto (pendiente, aprobado, rechazado)
- Datos almacenados localmente en el navegador (localStorage)
- Botón de cerrar sesión
- Diseño responsive y profesional

**Campos del presupuesto:**
- Cliente (nombre)
- Descripción del servicio
- Monto en pesos argentinos
- Notas adicionales
- Fecha de creación (automática)
- Estado (pendiente por defecto)

## 🔧 Configuración

### Cambiar la Contraseña

Para cambiar la contraseña de acceso, edite el archivo `login.html` y modifique la constante:

```javascript
// Línea ~125 en login.html
const CORRECT_PASSWORD = 'BeristainSocios2025';
```

**⚠️ IMPORTANTE:** Cambie esta contraseña antes de desplegar el sitio en producción.

### Configurar Intentos y Bloqueo

También en `login.html`:

```javascript
const MAX_ATTEMPTS = 5;  // Máximo de intentos permitidos
const LOCKOUT_TIME = 5 * 60 * 1000;  // Tiempo de bloqueo en milisegundos
```

## 🚀 Flujo de Usuario

1. **Acceso inicial**
   - Usuario hace clic en "Socios" en la barra de navegación
   - Se muestra la página de login

2. **Autenticación**
   - Usuario ingresa la contraseña
   - Si es correcta: redirige a `presupuestos.html`
   - Si es incorrecta: muestra error y resta intentos disponibles
   - Después de 5 intentos fallidos: bloqueo temporal de 5 minutos

3. **Área de Presupuestos**
   - Ver estadísticas y listado de presupuestos
   - Crear nuevos presupuestos
   - Eliminar presupuestos existentes
   - Cerrar sesión cuando termine

4. **Cierre de Sesión**
   - Automático al cerrar el navegador
   - Manual con el botón "Cerrar sesión"
   - Redirige al login

## 💾 Almacenamiento de Datos

### SessionStorage (Autenticación)
- `authenticated`: Estado de autenticación (true/false)
- `loginTime`: Timestamp del login

### LocalStorage (Datos de Aplicación)
- `presupuestos`: Array con todos los presupuestos
- `loginAttempts`: Contador de intentos fallidos
- `lockoutUntil`: Timestamp hasta cuando está bloqueado el acceso

### Seguridad de Datos
- Los presupuestos se almacenan localmente en el navegador del usuario
- No se envían a ningún servidor externo
- Si se borra el caché del navegador, se pierden los datos
- Para implementación en producción, considere usar una base de datos

## 🎨 Diseño

- **Colores principales:**
  - Azul oscuro: #1a365d (color corporativo)
  - Azul medio: #2d5a8a
  - Dorado: #c9a961 (acento)

- **Tipografías:**
  - Inter (texto general)
  - Playfair Display (títulos)

- **Responsive:** Totalmente adaptado para móviles y tablets

## 📝 Notas Técnicas

### Compatibilidad
- Funciona en todos los navegadores modernos
- Requiere JavaScript habilitado
- No requiere conexión a internet una vez cargado

### Metadatos SEO
- Ambas páginas tienen `noindex, nofollow` para evitar indexación
- No aparecerán en resultados de búsqueda

### Mejoras Futuras Sugeridas

1. **Backend:**
   - Implementar autenticación con JWT o sesiones del servidor
   - Base de datos para almacenar presupuestos
   - API REST para operaciones CRUD

2. **Funcionalidades:**
   - Exportar presupuestos a PDF
   - Enviar presupuestos por email
   - Filtros y búsqueda en la tabla
   - Editar presupuestos existentes
   - Múltiples usuarios con roles diferentes

3. **Seguridad:**
   - Autenticación de dos factores (2FA)
   - Hash de contraseñas en el servidor
   - Certificado SSL/HTTPS
   - Logs de auditoría

## 🐛 Resolución de Problemas

### "No puedo acceder a /presupuestos"
- Asegúrese de que el archivo `presupuestos.html` existe en `/frontend/`
- Verifique que está autenticado en `login.html` primero

### "Se perdieron mis presupuestos"
- Los datos están en localStorage del navegador
- Si limpia el caché, se borran los datos
- Recomiende no limpiar el caché o implementar respaldo en servidor

### "La contraseña no funciona"
- Contraseña por defecto: `BeristainSocios2025`
- Verifica mayúsculas/minúsculas
- Si cambió la contraseña en el código, use la nueva

## 📧 Contacto

Para soporte técnico o consultas sobre este sistema, contacte al equipo de desarrollo.

---

**Última actualización:** 2025-11-10
**Versión:** 1.0.0
