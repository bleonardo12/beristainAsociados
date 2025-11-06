# 📘 Guía Completa de Despliegue - Paso a Paso

Esta guía te explica desde cero cómo trabajar con tu sitio web local y desplegarlo en el VPS.

---

## 📍 PASO 1: Entender Local vs VPS

### ¿Qué es Local?
**Local** = Tu computadora personal donde trabajas
- **Ubicación:** Tu PC/laptop
- **Ruta del proyecto:** `/home/user/beristainAsociados` (o donde tengas el proyecto)
- **Acceso:** Directo, estás ahí mismo
- **Editor:** Visual Studio Code (VSC)
- **Terminal:** VSC Terminal (Bash)

### ¿Qué es el VPS (Servidor)?
**VPS** = Servidor remoto donde está publicado tu sitio web
- **Ubicación:** Servidor en internet (`srv777726`)
- **Ruta del repositorio:** `/home/usuario/beristainAsociados` (repositorio bare)
- **Ruta del sitio web:** `/var/www/beristainAsociados/frontend`
- **Acceso:** Por SSH (conexión remota)
- **URL pública:** https://beristainyasociados.com.ar

### Flujo de Trabajo

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  TU COMPUTADORA │         │     GITHUB       │         │   VPS/SERVIDOR  │
│    (LOCAL)      │ ──────> │  (Repositorio)   │ ──────> │   (Producción)  │
│                 │  PUSH   │                  │  PUSH   │                 │
│  Editas código  │         │  Guarda código   │         │ Sitio web público│
│  en VSCode      │         │                  │         │ beristainyasociados│
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

---

## 🔧 PASO 2: Configuración Inicial (Solo Primera Vez)

### 2.1 Verificar Git en Local

Abre VSCode, luego abre la terminal integrada:
- **Windows/Linux:** `Ctrl + ñ` o `Ctrl + '`
- **Mac:** `Cmd + ñ` o `Cmd + '`

Verifica que estás en tu proyecto:

```bash
# Ver en qué carpeta estás
pwd

# Debe mostrar algo como: /home/user/beristainAsociados
# Si no estás ahí, navega a tu proyecto:
cd /home/user/beristainAsociados
```

### 2.2 Verificar Configuración de Git

```bash
# Ver tu configuración actual
git config --list

# Verificar el remoto (debe apuntar a GitHub)
git remote -v

# Debe mostrar algo como:
# origin  https://github.com/bleonardo12/beristainAsociados.git
```

### 2.3 Verificar Ramas

```bash
# Ver en qué rama estás
git branch

# Ver todas las ramas (local y remotas)
git branch -a
```

---

## 📝 PASO 3: Editar y Preparar Cambios en Local

### 3.1 Hacer Cambios en tu Código

1. Abre tu archivo en VSCode:
   - Ejemplo: `frontend/index.html`

2. Haz tus cambios (edita texto, CSS, etc.)

3. **Guarda el archivo:** `Ctrl + S` (o `Cmd + S` en Mac)

### 3.2 Verificar los Cambios

En la terminal de VSCode:

```bash
# Ver qué archivos modificaste
git status

# Debe mostrar en rojo los archivos modificados, ejemplo:
# modified:   frontend/index.html

# Ver exactamente qué cambiaste
git diff frontend/index.html
```

---

## 🚀 PASO 4: Enviar Cambios al VPS

### 4.1 Opción A: Subir a la Rama Principal (main o master)

Este método hace que los cambios se desplieguen automáticamente al VPS.

```bash
# 1. Agregar los archivos modificados
git add frontend/index.html
# O agregar todos los cambios:
git add .

# 2. Verificar qué vas a commitear
git status
# Debe mostrar en verde los archivos que se van a commitear

# 3. Crear el commit con un mensaje descriptivo
git commit -m "Actualizar contenido del index.html"

# 4. Subir al repositorio remoto
git push origin main
# O si tu rama principal es master:
# git push origin master
```

**IMPORTANTE:** Si tu rama principal es `main` pero en el VPS está configurado `master`, necesitas:
- Opción 1: Cambiar el nombre de tu rama local a `master`
- Opción 2: Configurar el VPS para usar `main` (el hook que creamos lo hace automáticamente)

### 4.2 Opción B: Trabajar en una Rama de Desarrollo

Si no quieres afectar el sitio de inmediato:

```bash
# 1. Crear y cambiar a una nueva rama
git checkout -b mi-rama-cambios

# 2. Agregar y commitear
git add .
git commit -m "Cambios en index.html"

# 3. Subir la rama al repositorio
git push origin mi-rama-cambios

# 4. Cuando estés listo, fusiona con main:
git checkout main
git merge mi-rama-cambios
git push origin main
```

### 4.3 Verificar que el Push fue Exitoso

```bash
# Ver el historial de commits
git log --oneline -5

# El último commit debe ser el tuyo
```

---

## 🔐 PASO 5: Conectarse al VPS por SSH

### 5.1 Desde la Terminal de VSCode

**Comando básico:**
```bash
ssh usuario@srv777726
```

Donde:
- `usuario` = tu nombre de usuario en el servidor
- `srv777726` = el nombre/IP de tu servidor

**Ejemplo con IP:**
```bash
ssh usuario@123.456.789.10
```

### 5.2 Primera Conexión

Si es la primera vez que te conectas, verás algo como:

```
The authenticity of host 'srv777726 (...)' can't be established.
ED25519 key fingerprint is SHA256:Ka7ALCqMPWR7d0VKjc+RMWki51fYQWHtR1V0vdU+ql0.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Escribe:** `yes` y presiona Enter

### 5.3 Autenticación

Luego te pedirá la contraseña:

```
usuario@srv777726's password:
```

**Escribe tu contraseña** (no se verá mientras escribes, es normal) y presiona Enter.

### 5.4 Estás Dentro del VPS

Verás un prompt diferente, algo como:

```
usuario@srv777726:~$
```

O si eres root:

```
root@srv777726:~#
```

---

## 🔍 PASO 6: Verificar el Despliegue en el VPS

Una vez conectado al VPS por SSH:

### 6.1 Usar el Script de Verificación

```bash
# Copiar y ejecutar el script de verificación
cat > /tmp/verificar-deploy.sh << 'EOF'
#!/bin/bash
echo "=== VERIFICACIÓN DE DESPLIEGUE ==="
echo ""
echo "1. Último despliegue:"
tail -5 /tmp/git_deploy_log.txt 2>/dev/null || echo "No hay log"
echo ""
echo "2. Commit desplegado:"
cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt 2>/dev/null
echo ""
echo "3. Fecha del despliegue:"
cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt 2>/dev/null
echo ""
echo "4. Estado del sitio web:"
curl -sI https://beristainyasociados.com.ar/index.html | head -5
EOF

chmod +x /tmp/verificar-deploy.sh
/tmp/verificar-deploy.sh
```

### 6.2 Verificar Manualmente

```bash
# Ver el log del despliegue
tail -30 /tmp/git_deploy_log.txt

# Ver qué commit está desplegado
cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt

# Ver cuándo se desplegó
cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt

# Ver las ramas del repositorio
git --git-dir=/home/usuario/beristainAsociados for-each-ref --format='%(refname:short): %(objectname:short)' refs/heads/
```

### 6.3 Si el Despliegue NO Ocurrió Automáticamente

Ejecuta el hook manualmente:

```bash
# Forzar el despliegue
echo "" | /home/usuario/beristainAsociados/hooks/post-receive

# Ver el resultado
tail -30 /tmp/git_deploy_log.txt
```

### 6.4 Salir del VPS

Cuando termines:

```bash
exit
# O presiona Ctrl + D
```

Volverás a tu terminal local.

---

## 🌐 PASO 7: Verificar en el Navegador

### 7.1 Limpiar Caché del Navegador

1. Abre tu sitio: **https://beristainyasociados.com.ar**

2. **Fuerza la recarga sin caché:**
   - **Windows/Linux:** `Ctrl + Shift + R`
   - **Mac:** `Cmd + Shift + R`

### 7.2 Usar Modo Incógnito

1. Abre una ventana de incógnito/privada:
   - **Chrome:** `Ctrl + Shift + N` (o `Cmd + Shift + N`)
   - **Firefox:** `Ctrl + Shift + P` (o `Cmd + Shift + P`)

2. Visita: **https://beristainyasociados.com.ar**

### 7.3 Ver el Código Fuente

1. Click derecho en la página → **"Ver código fuente"**
2. Busca tus cambios específicos (Ctrl + F para buscar texto)

---

## 🔄 PASO 8: Flujo Completo - Resumen

### Desde Tu Computadora (Local):

```bash
# 1. Navegar a tu proyecto
cd /home/user/beristainAsociados

# 2. Editar archivo (en VSCode)
# ... haces cambios en frontend/index.html ...

# 3. Ver cambios
git status
git diff

# 4. Agregar cambios
git add .

# 5. Commit
git commit -m "Descripción de tus cambios"

# 6. Push a GitHub
git push origin main
```

### En el VPS (Servidor):

```bash
# 1. Conectar por SSH
ssh usuario@srv777726

# 2. Verificar despliegue
tail -20 /tmp/git_deploy_log.txt

# 3. (Opcional) Forzar despliegue si no se hizo automático
echo "" | /home/usuario/beristainAsociados/hooks/post-receive

# 4. Salir
exit
```

### En el Navegador:

1. Abrir: https://beristainyasociados.com.ar
2. Presionar: `Ctrl + Shift + R`
3. Verificar los cambios

---

## 🆘 PASO 9: Solución de Problemas Comunes

### Problema 1: "Permission denied (publickey)"

Al hacer SSH:
```bash
ssh usuario@srv777726
```

**Solución:** Usa contraseña o configura una clave SSH:
```bash
ssh-keygen -t ed25519 -C "tu@email.com"
ssh-copy-id usuario@srv777726
```

### Problema 2: Los cambios no aparecen en el VPS

**Solución:**
```bash
# Conectarse al VPS
ssh usuario@srv777726

# Ejecutar el hook manualmente
echo "" | /home/usuario/beristainAsociados/hooks/post-receive

# Ver errores
tail -50 /tmp/git_deploy_log.txt
```

### Problema 3: "fatal: not a git repository"

**Solución:** Estás en la carpeta incorrecta
```bash
# Ver dónde estás
pwd

# Ir a tu proyecto
cd /home/user/beristainAsociados
```

### Problema 4: Los cambios no aparecen en el navegador

**Soluciones:**
1. **Limpiar caché:** `Ctrl + Shift + R`
2. **Modo incógnito:** `Ctrl + Shift + N`
3. **Borrar caché del navegador:** Configuración → Privacidad → Borrar datos
4. **Esperar 2-3 minutos:** A veces los cambios tardan un poco

---

## 📚 PASO 10: Comandos de Referencia Rápida

### En Local (VSCode Terminal):

```bash
# Ver estado
git status

# Ver cambios
git diff

# Agregar todo
git add .

# Commit
git commit -m "mensaje"

# Push
git push origin main

# Ver historial
git log --oneline -10
```

### En el VPS (SSH):

```bash
# Conectar
ssh usuario@srv777726

# Ver log de deploy
tail -50 /tmp/git_deploy_log.txt

# Forzar deploy
echo "" | /home/usuario/beristainAsociados/hooks/post-receive

# Ver commit desplegado
cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt

# Ver fecha de deploy
cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt

# Salir
exit
```

---

## ✅ CHECKLIST: ¿Hice Todo Bien?

Marca cada paso conforme lo completes:

- [ ] 1. Edité el archivo en VSCode (Local)
- [ ] 2. Guardé el archivo (`Ctrl + S`)
- [ ] 3. Ejecuté `git status` y vi mis cambios
- [ ] 4. Ejecuté `git add .`
- [ ] 5. Ejecuté `git commit -m "mensaje"`
- [ ] 6. Ejecuté `git push origin main`
- [ ] 7. Me conecté al VPS por SSH
- [ ] 8. Verifiqué el log de despliegue
- [ ] 9. Vi "Despliegue completado" en el log
- [ ] 10. Abrí el sitio web en el navegador
- [ ] 11. Presioné `Ctrl + Shift + R` para recargar sin caché
- [ ] 12. ¡Vi mis cambios en línea! 🎉

---

## 🎯 Ejemplo Práctico Completo

### Escenario: Cambiar el título de la página

#### PASO A: En Local (VSCode)

```bash
# 1. Abrir terminal en VSCode (Ctrl + ñ)

# 2. Verificar ubicación
pwd
# Debe mostrar: /home/user/beristainAsociados

# 3. Abrir frontend/index.html en VSCode y cambiar:
# <title>Viejo Título</title>
# Por:
# <title>Nuevo Título Actualizado</title>

# 4. Guardar (Ctrl + S)

# 5. Ver cambios en terminal
git status
# Debe mostrar: modified: frontend/index.html

git diff frontend/index.html
# Verás tus cambios marcados en verde/rojo

# 6. Preparar para commit
git add frontend/index.html

# 7. Crear commit
git commit -m "Actualizar título de la página principal"

# 8. Subir a GitHub
git push origin main
# Verás: "Writing objects: 100%"
```

#### PASO B: En el VPS

```bash
# 1. Conectar
ssh usuario@srv777726
# Ingresar contraseña

# 2. Verificar despliegue
tail -20 /tmp/git_deploy_log.txt
# Buscar: "Despliegue completado."

# 3. Ver qué commit está desplegado
cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt
# Debe coincidir con tu último commit

# 4. Salir
exit
```

#### PASO C: En el Navegador

1. Abrir: https://beristainyasociados.com.ar
2. Presionar: `Ctrl + Shift + R`
3. Ver la pestaña del navegador - debe mostrar: "Nuevo Título Actualizado"

**¡LISTO!** 🎉

---

## 💡 Consejos Finales

1. **Siempre haz commits pequeños y frecuentes** con mensajes descriptivos
2. **Verifica en el VPS después de cada push importante**
3. **Guarda tus contraseñas de forma segura** (usa un gestor de contraseñas)
4. **Haz backups regularmente** de tu código
5. **Prueba los cambios en local primero** antes de subirlos
6. **Documenta tus cambios** para referencia futura
7. **Si algo sale mal, NO entres en pánico** - todo se puede revertir con Git

---

¿Tienes dudas sobre algún paso específico? ¡Pregúntame!
