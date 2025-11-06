# 🚀 Guía Personalizada - Tu Flujo de Trabajo

Esta guía está adaptada específicamente a **tu configuración**:
- **PC Local:** `/d/EXTRA/hostinger` (Disco D:)
- **Terminal:** Git Bash (MINGW64) en Windows
- **Rama principal:** `master`
- **VPS:** 69.62.95.98 (Hostinger)
- **Sitio web:** https://beristainyasociados.com.ar

---

## ⚡ TU FLUJO DIARIO (3 Pasos Simples)

### 📝 PASO 1: Editar tu código
1. Abre Visual Studio Code
2. Navega a: `D:\EXTRA\hostinger`
3. Edita tus archivos (ejemplo: `frontend/index.html`)
4. Guarda: `Ctrl + S`

### 💾 PASO 2: Hacer commit
```bash
# Abrir Git Bash en VSCode (Ctrl + ñ)

# Ver qué cambiaste
git status

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Descripción de tus cambios"
```

### 🚀 PASO 3: Desplegar (UN SOLO COMANDO)

**Opción A (Recomendada):**
```bash
git deploy
```

**Opción B (Alternativa):**
```bash
git push all master
```

✅ **¡Listo!** Esto automáticamente:
1. Sube a GitHub (backup)
2. Sube al VPS (Hostinger)
3. Despliega en https://beristainyasociados.com.ar

---

## 🌐 VERIFICAR LOS CAMBIOS

### En el Navegador:
1. Abre: https://beristainyasociados.com.ar
2. Recarga sin caché: **Ctrl + Shift + R**
3. ¡Verás tus cambios!

### En el VPS (si quieres verificar):
```bash
# Conectar al VPS
ssh root@69.62.95.98

# Ver el log del despliegue
tail -30 /tmp/git_deploy_log.txt

# Debe mostrar: "✓ Despliegue completado exitosamente."

# Salir
exit
```

---

## 📋 COMANDOS MÁS USADOS

### En Local (Git Bash):

```bash
# Ver en qué carpeta estás
pwd
# Debe mostrar: /d/EXTRA/hostinger

# Ir a tu proyecto (si no estás ahí)
cd /d/EXTRA/hostinger

# Ver qué archivos modificaste
git status

# Ver los cambios específicos
git diff

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Tu mensaje descriptivo"

# Desplegar todo (GitHub + VPS + Web)
git deploy

# Ver el historial de commits
git log --oneline -10

# Ver en qué rama estás
git branch
```

---

## 🎯 EJEMPLO COMPLETO

Imagina que quieres cambiar el texto del encabezado:

```bash
# 1. Abrir Git Bash en VSCode (Ctrl + ñ)
cd /d/EXTRA/hostinger

# 2. Editar frontend/index.html en VSCode
# Cambiar: <h1>Título Viejo</h1>
# Por:     <h1>Título Nuevo</h1>
# Guardar: Ctrl + S

# 3. Ver los cambios
git status
git diff frontend/index.html

# 4. Preparar el commit
git add frontend/index.html

# 5. Hacer commit
git commit -m "Actualizar título del encabezado"

# 6. Desplegar
git deploy

# ¡Listo! Espera 10-20 segundos y:
# - Ve a: https://beristainyasociados.com.ar
# - Presiona: Ctrl + Shift + R
# - ¡Verás el nuevo título!
```

---

## 🔧 CONFIGURACIÓN ACTUAL

### Remotos configurados:
```
origin  → GitHub (backup)
vps     → Hostinger (servidor web)
all     → Ambos simultáneamente
```

### Comandos de despliegue:
```bash
# Comando corto (recomendado):
git deploy

# Comando alternativo:
git push all master

# Comandos separados (si es necesario):
git push origin master  # Solo GitHub
git push vps master     # Solo VPS
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### El comando `git deploy` no funciona:
```bash
# Recrear el alias
git config --global alias.deploy '!git push origin master && git push vps master'
```

### Los cambios no aparecen en el sitio web:
1. **Espera 20-30 segundos** después del push
2. **Recarga sin caché:** `Ctrl + Shift + R`
3. **Abre en modo incógnito:** `Ctrl + Shift + N`
4. **Verifica el log en VPS:**
   ```bash
   ssh root@69.62.95.98
   tail -30 /tmp/git_deploy_log.txt
   exit
   ```

### Pide contraseña del VPS cada vez:
Puedes configurar una clave SSH para no ingresar contraseña:
```bash
# Generar clave SSH (si no tienes)
ssh-keygen -t ed25519 -C "tu@email.com"

# Copiar la clave al VPS
ssh-copy-id root@69.62.95.98

# Ahora git deploy no pedirá contraseña
```

### Error "not a git repository":
```bash
# Verifica que estás en la carpeta correcta
pwd
# Debe mostrar: /d/EXTRA/hostinger

# Si no estás ahí:
cd /d/EXTRA/hostinger
```

### No sé qué cambié:
```bash
# Ver archivos modificados
git status

# Ver los cambios línea por línea
git diff

# Ver solo los nombres de archivos
git diff --name-only
```

---

## ✅ CHECKLIST DIARIO

Antes de terminar tu día de trabajo:

- [ ] Hice commit de todos mis cambios: `git status` (debe decir "working tree clean")
- [ ] Desplegué al servidor: `git deploy`
- [ ] Verifiqué en el navegador: https://beristainyasociados.com.ar
- [ ] Todo funciona correctamente

---

## 💡 CONSEJOS PRO

### 1. Commits Frecuentes
Haz commits pequeños y frecuentes con mensajes claros:
```bash
✅ Bueno: "Actualizar formulario de contacto con validación"
❌ Malo:  "cambios"
```

### 2. Mensajes Descriptivos
Usa mensajes que expliquen QUÉ y POR QUÉ:
```bash
git commit -m "Corregir error en formulario que no enviaba emails"
git commit -m "Agregar sección de testimonios solicitada por cliente"
git commit -m "Optimizar imágenes para mejorar velocidad de carga"
```

### 3. Revisa Antes de Hacer Commit
```bash
# Siempre revisa qué vas a commitear
git status
git diff

# Luego haz el commit
git add .
git commit -m "Tu mensaje"
```

### 4. Backup Regular
Como ahora todo sube a GitHub automáticamente, tienes backup constante. Si algo sale mal:
```bash
# Ver versiones anteriores
git log --oneline -20

# Volver a una versión anterior (cuidado!)
git revert <commit-hash>
```

---

## 🎯 TU FLUJO OPTIMIZADO

```
1. Editar código en VSCode
        ↓
2. git add . && git commit -m "mensaje"
        ↓
3. git deploy
        ↓
4. Ctrl + Shift + R en navegador
        ↓
5. ¡Cambios en línea! ✅
```

**Tiempo total:** ~30 segundos desde el commit hasta ver los cambios online.

---

## 📞 COMANDOS DE EMERGENCIA

### Cancelar cambios no guardados:
```bash
# Descartar cambios en un archivo
git checkout -- archivo.html

# Descartar TODOS los cambios no guardados (¡cuidado!)
git reset --hard HEAD
```

### Ver qué se desplegó:
```bash
ssh root@69.62.95.98
cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt
cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt
exit
```

### Forzar redespliegue:
```bash
ssh root@69.62.95.98
echo "" | /home/usuario/beristainAsociados/hooks/post-receive
tail -30 /tmp/git_deploy_log.txt
exit
```

---

## 🎓 RESUMEN EJECUTIVO

**Lo que necesitas recordar:**

1. **Editar** → Guardar (`Ctrl + S`)
2. **Commit** → `git add . && git commit -m "mensaje"`
3. **Desplegar** → `git deploy`
4. **Verificar** → `Ctrl + Shift + R` en navegador

**¡Eso es todo!** 🚀

---

¿Dudas? Revisa esta guía o contacta al soporte técnico.
