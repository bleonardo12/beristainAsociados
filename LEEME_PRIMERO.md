# 👋 ¡Bienvenido! - Lee esto primero

## 📚 Recursos Disponibles

Este proyecto incluye varias guías y herramientas para ayudarte a desplegar tus cambios fácilmente:

### 🎯 Para Empezar

1. **`GUIA_COMPLETA_DEPLOY.md`** ⭐ EMPIEZA AQUÍ
   - Guía detallada paso a paso
   - Explica TODO desde cero
   - Incluye ejemplos prácticos
   - Solución de problemas
   - **👉 Lee esto si es tu primera vez**

2. **`GUIA_RAPIDA.md`**
   - Referencia rápida de comandos
   - Tabla de comandos más usados
   - Para cuando ya sabes qué hacer
   - **👉 Úsalo como cheatsheet**

3. **`deploy-asistido.sh`** ⚡ RECOMENDADO
   - Script interactivo
   - Te guía paso a paso automáticamente
   - Verifica todo antes de hacer cambios
   - **👉 Ejecuta `./deploy-asistido.sh` en tu terminal**

### 🔧 Herramientas Adicionales

4. **`hooks/`** - Configuración del servidor
   - `post-receive` - Hook de despliegue automático
   - `instalar-hook.sh` - Instalador del hook en VPS
   - `verificar-deploy.sh` - Script de verificación
   - `README.md` - Documentación del hook
   - `INSTRUCCIONES_INSTALACION.md` - Guía de instalación
   - `VERIFICAR_DEPLOY.md` - Métodos de verificación

---

## 🚀 Inicio Rápido (3 opciones)

### Opción 1: Usar el Script Asistido (MÁS FÁCIL)

```bash
cd /home/user/beristainAsociados
./deploy-asistido.sh
```

El script te guiará paso a paso.

### Opción 2: Comandos Manuales (RÁPIDO)

```bash
# En tu terminal de VSCode:
git add .
git commit -m "Descripción de tus cambios"
git push origin main
```

### Opción 3: Leer la Guía Completa (PARA APRENDER)

Abre `GUIA_COMPLETA_DEPLOY.md` y sigue las instrucciones.

---

## 📋 Flujo de Trabajo Visual

```
TU COMPUTADORA (LOCAL)          GITHUB              VPS/SERVIDOR
     VSCode                                        srv777726
        │                          │                    │
        │ 1. Editar código         │                    │
        │ 2. git add .             │                    │
        │ 3. git commit            │                    │
        │ 4. git push ────────────>│                    │
        │                          │                    │
        │                          │ 5. Hook automático │
        │                          │ ──────────────────>│
        │                          │                    │
        │                          │                    │ 6. Deploy
        │                          │                    │    frontend/
        │                          │                    │
        │ 7. Verificar en navegador                     │
        │ https://beristainyasociados.com.ar <─────────┘
        │    (Ctrl + Shift + R)
        │
```

---

## ❓ ¿Qué Guía Usar?

### Si eres nuevo:
→ Lee **`GUIA_COMPLETA_DEPLOY.md`**

### Si ya sabes lo básico:
→ Usa **`GUIA_RAPIDA.md`** como referencia

### Si quieres automatizar:
→ Ejecuta **`./deploy-asistido.sh`**

### Si algo no funciona:
→ Lee la sección de "Solución de Problemas" en **`GUIA_COMPLETA_DEPLOY.md`**

---

## 🆘 Ayuda Rápida

### Los cambios no aparecen en el sitio:
1. Recarga sin caché: `Ctrl + Shift + R`
2. Verifica el log en VPS: `ssh usuario@srv777726` → `tail -30 /tmp/git_deploy_log.txt`
3. Fuerza el despliegue: `echo "" | /home/usuario/beristainAsociados/hooks/post-receive`

### No sé si se desplegó:
```bash
ssh usuario@srv777726
cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt
exit
```

### Error al hacer push:
```bash
git status  # Ver qué pasa
git pull origin main  # Sincronizar primero
git push origin main  # Intentar de nuevo
```

---

## 📞 Comandos Más Usados

### Local (VSCode Terminal):
```bash
git status                    # Ver cambios
git add .                     # Agregar todo
git commit -m "mensaje"       # Guardar cambios
git push origin main          # Subir a GitHub
```

### VPS (SSH):
```bash
ssh usuario@srv777726        # Conectar
tail -30 /tmp/git_deploy_log.txt  # Ver log
exit                         # Salir
```

### Navegador:
- `Ctrl + Shift + R` = Recargar sin caché
- `Ctrl + Shift + N` = Modo incógnito

---

## 📁 Estructura del Proyecto

```
beristainAsociados/
│
├── 📄 LEEME_PRIMERO.md          ← Estás aquí
├── 📘 GUIA_COMPLETA_DEPLOY.md   ← Guía detallada
├── ⚡ GUIA_RAPIDA.md             ← Referencia rápida
├── 🚀 deploy-asistido.sh        ← Script interactivo
│
├── frontend/                    ← Tu sitio web
│   ├── index.html
│   ├── styles.css
│   └── ...
│
├── backend/                     ← Servidor Node.js
│   └── ...
│
└── hooks/                       ← Configuración VPS
    ├── post-receive             ← Hook de despliegue
    ├── instalar-hook.sh
    ├── verificar-deploy.sh
    └── *.md
```

---

## ✅ Checklist de Primera Vez

Si es tu primera vez usando este sistema:

- [ ] 1. Lee `GUIA_COMPLETA_DEPLOY.md` (al menos el PASO 1 y 2)
- [ ] 2. Verifica que puedes conectarte al VPS: `ssh usuario@srv777726`
- [ ] 3. Instala el hook en el VPS (ver `hooks/INSTRUCCIONES_INSTALACION.md`)
- [ ] 4. Haz un cambio de prueba en `frontend/index.html`
- [ ] 5. Ejecuta `./deploy-asistido.sh` para subir el cambio
- [ ] 6. Verifica en el navegador que funcionó

---

## 🎯 Objetivo de Este Sistema

El objetivo es que puedas:
1. **Editar tu código** en VSCode (local)
2. **Hacer push** a GitHub con un solo comando
3. **Ver los cambios** automáticamente en tu sitio web público

Todo sin tener que copiar archivos manualmente o conectarte al VPS cada vez.

---

## 💡 Tip Final

**Guarda esta página en favoritos:**
- `GUIA_COMPLETA_DEPLOY.md` para aprender
- `GUIA_RAPIDA.md` para consultas rápidas
- `./deploy-asistido.sh` para usar día a día

---

¡Listo para empezar! 🚀

**Siguiente paso:** Abre `GUIA_COMPLETA_DEPLOY.md` o ejecuta `./deploy-asistido.sh`
