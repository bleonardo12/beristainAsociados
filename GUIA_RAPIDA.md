# ⚡ Guía Rápida - Desplegar Cambios

## 🎯 Flujo Básico en 3 Pasos

### ✏️ PASO 1: En Local (VSCode)

```bash
# Editar tu archivo, guardar (Ctrl + S), luego:
git add .
git commit -m "Descripción del cambio"
git push origin main
```

### 🔐 PASO 2: En el VPS (SSH)

```bash
# Conectar
ssh usuario@srv777726

# Verificar
tail -20 /tmp/git_deploy_log.txt

# Salir
exit
```

### 🌐 PASO 3: En el Navegador

1. Abrir: https://beristainyasociados.com.ar
2. Presionar: **Ctrl + Shift + R**

---

## 📋 Comandos Más Usados

### En Local (Terminal VSCode):

| Comando | Para qué sirve |
|---------|----------------|
| `pwd` | Ver en qué carpeta estás |
| `cd /home/user/beristainAsociados` | Ir a tu proyecto |
| `git status` | Ver qué archivos modificaste |
| `git diff` | Ver exactamente qué cambiaste |
| `git add .` | Preparar todos los cambios |
| `git commit -m "mensaje"` | Guardar los cambios con descripción |
| `git push origin main` | Subir al servidor (GitHub) |
| `git log --oneline -5` | Ver últimos 5 commits |

### En VPS (SSH):

| Comando | Para qué sirve |
|---------|----------------|
| `ssh usuario@srv777726` | Conectarse al servidor |
| `tail -20 /tmp/git_deploy_log.txt` | Ver log de despliegue |
| `cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt` | Ver cuándo se desplegó |
| `echo "" \| /home/usuario/beristainAsociados/hooks/post-receive` | Forzar despliegue |
| `exit` | Salir del servidor |

---

## 🚨 Soluciones Rápidas

### Los cambios no se ven en el navegador:
1. `Ctrl + Shift + R` (recarga sin caché)
2. Abrir en modo incógnito
3. Esperar 2-3 minutos

### El despliegue no ocurrió automáticamente:
```bash
ssh usuario@srv777726
echo "" | /home/usuario/beristainAsociados/hooks/post-receive
tail -30 /tmp/git_deploy_log.txt
exit
```

### Olvidé en qué rama estoy:
```bash
git branch
# La rama con * es la actual
```

---

## 🔄 Ejemplo Completo

```bash
# === EN LOCAL (VSCode Terminal) ===
cd /home/user/beristainAsociados
# ... editar frontend/index.html en VSCode ...
git add .
git commit -m "Actualizar contenido del index"
git push origin main

# === EN VPS (SSH) ===
ssh usuario@srv777726
tail -20 /tmp/git_deploy_log.txt
# Buscar: "Despliegue completado."
exit

# === EN NAVEGADOR ===
# Abrir: https://beristainyasociados.com.ar
# Presionar: Ctrl + Shift + R
```

---

## 📞 Atajos de Teclado Útiles

### En VSCode:
- `Ctrl + ñ` → Abrir/cerrar terminal
- `Ctrl + S` → Guardar archivo
- `Ctrl + F` → Buscar en archivo
- `Ctrl + Shift + F` → Buscar en todo el proyecto

### En el Navegador:
- `Ctrl + Shift + R` → Recargar sin caché
- `Ctrl + Shift + N` → Modo incógnito (Chrome)
- `Ctrl + U` → Ver código fuente
- `F12` → Abrir herramientas de desarrollador

---

## ✅ Checklist Rápido

- [ ] Edité y guardé el archivo
- [ ] `git add .`
- [ ] `git commit -m "mensaje"`
- [ ] `git push origin main`
- [ ] Verifiqué el log en VPS
- [ ] Recar en el navegador con `Ctrl + Shift + R`
- [ ] ¡Cambios visibles! 🎉

---

Para más detalles, consulta: `GUIA_COMPLETA_DEPLOY.md`
