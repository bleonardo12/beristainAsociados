# Beristain & Asociados - Estudio Jurídico

## Descripción
Sitio web corporativo del estudio jurídico Beristain & Asociados con frontend modular, backend en Node.js y sistema de despliegue automatizado.

**URL:** https://beristainyasociados.com.ar

## Estructura del Proyecto
```
├── frontend/           # Archivos frontend
│   ├── index.html
│   ├── styles.css
│   └── includes/
├── backend/            # Backend y lógica de servidor
│   ├── server.js
│   ├── routes/
│   └── config/
├── js/                 # Módulos JavaScript
│   └── modules/
└── server/             # Configuraciones adicionales de servidor
```

## Requisitos
- Node.js
- npm o yarn

## Instalación
1. Clonar el repositorio
2. Instalar dependencias
   ```bash
   npm install
   ```

## Scripts
- `npm start`: Iniciar servidor
- `npm test`: Ejecutar pruebas

## Tecnologías
- Frontend: HTML, CSS, JavaScript modular
- Backend: Node.js
- Testing: Jest

## 🚀 Guías de Despliegue

Este proyecto incluye documentación completa en español para facilitar el desarrollo y despliegue:

### 📖 Guías Disponibles:

- **`GUIA_PERSONALIZADA.md`** ⭐ - Guía completa adaptada a tu configuración específica
- **`CHEATSHEET.md`** - Referencia rápida de comandos
- **`LEEME_PRIMERO.md`** - Índice de todos los recursos disponibles
- **`GUIA_COMPLETA_DEPLOY.md`** - Guía detallada paso a paso
- **`GUIA_RAPIDA.md`** - Flujo básico simplificado

### ⚡ Despliegue Rápido:

```bash
# Editar código, luego:
git add .
git commit -m "Descripción de cambios"
git deploy

# ¡Listo! Tus cambios están en línea
```

### 🛠️ Scripts Disponibles:

- **`deploy-rapido.sh`** - Script interactivo de despliegue
- **`deploy-asistido.sh`** - Asistente paso a paso
- **`hooks/`** - Configuración del servidor VPS

Ver **`GUIA_PERSONALIZADA.md`** para instrucciones completas.

---

## Contribución
1. Hacer fork del repositorio
2. Crear rama de feature
3. Commit de cambios
4. Ejecutar `git deploy`
5. Crear Pull Request