# Backend API - Beristain & Asociados

Backend RESTful API completo para el sistema de gestión de estudio jurídico con sincronización entre dispositivos.

## 🚀 FASE 2 - Backend Completo con Sincronización

Sistema backend completo con API REST, autenticación JWT, base de datos MySQL y sincronización multi-dispositivo.

## ✅ Estado: COMPLETO

Backend completamente funcional con todas las características implementadas:

### Características Principales

- ✅ **API RESTful completa** para presupuestos y causas
- ✅ **Autenticación JWT** con tokens seguros
- ✅ **Sistema de roles**: Admin, Socio, Secretaria, Viewer
- ✅ **Permisos granulares** por recurso y acción
- ✅ **Seguridad robusta**: bcrypt, rate limiting, helmet
- ✅ **Base de datos MySQL** con Sequelize ORM
- ✅ **Validación de datos** con express-validator
- ✅ **Sistema de backups** automático y manual
- ✅ **Logging profesional** con Winston
- ✅ **CORS configurado** para frontend
- ✅ **Compresión de respuestas**
- ✅ **Health checks**

## 📦 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones
│   │   ├── auth.js      # JWT y permisos
│   │   └── database.js  # Conexión MySQL
│   ├── controllers/     # Lógica de negocio
│   │   ├── authController.js
│   │   ├── presupuestosController.js
│   │   └── causasController.js
│   ├── middleware/      # Middlewares
│   │   ├── auth.js      # Autenticación y autorización
│   │   └── validation.js # Validación y sanitización
│   ├── models/          # Modelos de datos
│   │   ├── User.js
│   │   ├── Presupuesto.js
│   │   ├── Causa.js
│   │   └── index.js
│   ├── routes/          # Rutas API
│   │   ├── auth.js
│   │   ├── presupuestos.js
│   │   └── causas.js
│   ├── utils/           # Utilidades
│   │   ├── logger.js    # Sistema de logs
│   │   ├── migrate.js   # Migraciones
│   │   ├── seed.js      # Datos iniciales
│   │   └── backup.js    # Backups de BD
│   └── server.js        # Servidor Express
├── logs/                # Archivos de log
├── backups/             # Backups de BD
├── .env.example         # Ejemplo de variables de entorno
├── package.json
└── README.md
```

## 🔧 Instalación

### Requisitos Previos

- Node.js v18 o superior
- MySQL 8.0 o superior
- npm o yarn

### Paso 1: Instalar Dependencias

```bash
cd backend
npm install
```

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto backend:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Servidor
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=beristain_db
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_aqui
JWT_EXPIRES_IN=7d

# Frontend (para CORS)
FRONTEND_URL=http://localhost:8080

# Backups
ENABLE_AUTO_BACKUP=true
MAX_BACKUPS=7
```

### Paso 3: Crear Base de Datos

Conéctate a MySQL y crea la base de datos:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE beristain_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### Paso 4: Ejecutar Migraciones

Crea las tablas en la base de datos:

```bash
npm run migrate
```

Para recrear todas las tablas (CUIDADO: borra todos los datos):

```bash
npm run migrate -- --force
```

Para modificar tablas existentes:

```bash
npm run migrate -- --alter
```

### Paso 5: Crear Usuario Administrador

Ejecuta el script de seed para crear el primer usuario admin:

```bash
npm run seed
```

Te pedirá los datos del administrador:
- Nombre completo
- Email
- Password (mínimo 6 caracteres)

### Paso 6: Iniciar el Servidor

**Desarrollo (con auto-reload):**

```bash
npm run dev
```

**Producción:**

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### Autenticación

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|---------|
| POST | `/api/auth/login` | Login de usuario | Público |
| POST | `/api/auth/register` | Registrar usuario | Admin |
| GET | `/api/auth/verify` | Verificar token | Privado |
| POST | `/api/auth/logout` | Logout | Privado |

### Presupuestos

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|---------|
| GET | `/api/presupuestos` | Listar presupuestos | Privado |
| GET | `/api/presupuestos/:id` | Obtener presupuesto | Privado |
| POST | `/api/presupuestos` | Crear presupuesto | Crear |
| PUT | `/api/presupuestos/:id` | Actualizar presupuesto | Editar |
| DELETE | `/api/presupuestos/:id` | Eliminar presupuesto | Eliminar |
| GET | `/api/presupuestos/estadisticas` | Estadísticas | Privado |

### Causas

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|---------|
| GET | `/api/causas` | Listar causas | Privado |
| GET | `/api/causas/:id` | Obtener causa | Privado |
| POST | `/api/causas` | Crear causa | Crear |
| PUT | `/api/causas/:id` | Actualizar causa | Editar |
| DELETE | `/api/causas/:id` | Eliminar causa | Eliminar |
| PATCH | `/api/causas/:id/tareas` | Actualizar tareas | Editar |
| GET | `/api/causas/estadisticas` | Estadísticas | Privado |

### Parámetros de Query

**Paginación:**
- `page` - Número de página (default: 1)
- `limit` - Resultados por página (default: 10, max: 100)

**Filtros:**
- `estado` - Filtrar por estado
- `search` - Búsqueda por texto
- `fecha_desde` - Fecha desde (ISO)
- `fecha_hasta` - Fecha hasta (ISO)

**Ordenamiento:**
- `sort_by` - Campo para ordenar (default: created_at)
- `order` - asc o desc (default: desc)

**Ejemplo:**

```
GET /api/presupuestos?page=1&limit=20&estado=aprobado&sort_by=fecha&order=desc
```

## 🔐 Sistema de Roles y Permisos

### Roles Disponibles

1. **Admin** - Acceso completo a todo
2. **Socio** - CRUD completo de presupuestos y causas, backups, exportar
3. **Secretaria** - Crear, leer y actualizar presupuestos y causas
4. **Viewer** - Solo lectura de presupuestos y causas

### Formato de Permisos

Los permisos siguen el formato `recurso:accion`:

- `presupuestos:read` - Leer presupuestos
- `presupuestos:create` - Crear presupuestos
- `presupuestos:update` - Actualizar presupuestos
- `presupuestos:delete` - Eliminar presupuestos
- `presupuestos:*` - Todos los permisos de presupuestos
- `*` - Todos los permisos (solo admin)

## 🔑 Autenticación

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@beristain.cl",
    "password": "tu_password"
  }'
```

Respuesta:

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Admin",
      "email": "admin@beristain.cl",
      "rol": "admin"
    }
  }
}
```

### Usar Token en Requests

Incluye el token en el header `Authorization`:

```bash
curl -X GET http://localhost:3000/api/presupuestos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 💾 Sistema de Backups

### Crear Backup Manual

```bash
npm run backup create
```

### Listar Backups Disponibles

```bash
npm run backup list
```

### Restaurar Backup

```bash
npm run backup restore backups/backup_20240115_143022.sql
```

### Backups Automáticos

Los backups automáticos se ejecutan todos los días a las 2 AM si `ENABLE_AUTO_BACKUP=true` en el `.env`.

Se mantienen los últimos 7 backups automáticamente.

## 📊 Logs

Los logs se guardan en la carpeta `logs/`:

- `combined.log` - Todos los logs
- `error.log` - Solo errores

Los logs rotan automáticamente cuando alcanzan 5MB (máximo 5 archivos).

## 🚀 Despliegue en VPS

### Con PM2 (Recomendado)

1. Instalar PM2:

```bash
npm install -g pm2
```

2. Crear archivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'beristain-backend',
    script: 'src/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

3. Iniciar con PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Con Nginx Reverse Proxy

Configuración de Nginx:

```nginx
server {
    listen 80;
    server_name api.beristain.cl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/health
```

Respuesta:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T14:30:22.123Z",
  "uptime": 123.456
}
```

## 📝 Scripts Disponibles

```bash
npm start           # Iniciar servidor en producción
npm run dev         # Iniciar con nodemon (desarrollo)
npm run migrate     # Ejecutar migraciones
npm run seed        # Crear usuario admin inicial
npm run backup      # Ver comandos de backup
```

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ JWT con expiración configurable
- ✅ Rate limiting (100 req/15min general, 5 req/15min login)
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación y sanitización de inputs
- ✅ Bloqueo de cuenta después de 5 intentos fallidos
- ✅ SQL injection protegido por Sequelize
- ✅ XSS protegido por sanitización

## 🐛 Troubleshooting

### Error de conexión a MySQL

```bash
Error: Access denied for user 'root'@'localhost'
```

**Solución:** Verifica las credenciales en `.env` y que el usuario tenga permisos.

### Puerto en uso

```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:** Cambia el puerto en `.env` o mata el proceso que usa el puerto:

```bash
lsof -i :3000
kill -9 PID
```

### Tablas no existen

```bash
Error: Table 'beristain_db.users' doesn't exist
```

**Solución:** Ejecuta las migraciones:

```bash
npm run migrate
```

## 📞 Soporte

Para problemas o dudas, contacta al equipo de desarrollo.

## 📄 Licencia

Privado - Beristain & Asociados © 2024
