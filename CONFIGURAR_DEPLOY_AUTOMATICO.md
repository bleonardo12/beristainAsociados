# 🚀 Configurar Deploy Automático al VPS

## 📋 Resumen

Este documento explica cómo configurar el deploy automático desde GitHub a tu VPS usando GitHub Actions.

**Flujo Actual:**
1. Haces push a `master` → GitHub Actions se activa → Deploy automático al VPS

**Problema Actual:**
- El secreto `DEPLOY_KEY` no está configurado en GitHub
- Por eso el deploy automático no funciona

---

## ✅ Solución: Configurar el Secreto en GitHub

### Paso 1: Copiar la Clave SSH

El archivo `deploy_key` en la raíz del proyecto contiene la clave privada SSH. Necesitas copiarlo.

**Desde tu terminal:**
```bash
cat deploy_key
```

Copia TODO el contenido (incluyendo `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`)

### Paso 2: Agregar el Secreto en GitHub

1. Ve a tu repositorio en GitHub: https://github.com/bleonardo12/beristainAsociados

2. Haz clic en **Settings** (Configuración)

3. En el menú lateral izquierdo, haz clic en **Secrets and variables** → **Actions**

4. Haz clic en **New repository secret** (Nuevo secreto del repositorio)

5. Configura el secreto:
   - **Name:** `DEPLOY_KEY`
   - **Secret:** Pega el contenido completo del archivo `deploy_key`

6. Haz clic en **Add secret**

### Paso 3: Verificar que Funcione

Una vez configurado el secreto, el próximo push a `master` activará automáticamente el deploy.

**Para probarlo:**
```bash
# Hacer cualquier cambio pequeño
echo "# Test deploy automático" >> README.md

# Commitear y pushear a master
git add README.md
git commit -m "test: Probar deploy automático"
git push origin master
```

**Verificar en GitHub:**
1. Ve a la pestaña **Actions** en tu repositorio
2. Deberías ver el workflow "Deploy al VPS" ejecutándose
3. Haz clic para ver los logs en tiempo real

---

## 🔧 Flujo de Trabajo Mejorado

He mejorado el archivo `.github/workflows/deploy.yml` para que:

1. **Use `git fetch` y `git reset --hard`** (más seguro que `git pull`)
2. **Muestre mensajes claros** durante el proceso
3. **Maneje errores correctamente** (`set -e`)
4. **Muestre el último commit** desplegado

---

## 📊 Cómo Funciona Ahora

### Sin Deploy Automático (Antes)
```
1. Haces cambios en Claude Code
2. Commiteas a tu rama claude/...
3. Haces merge manual a master desde tu PC
4. Pusheas a master
5. SSH manual al VPS
6. git pull manual en el VPS
```

### Con Deploy Automático (Después de configurar)
```
1. Haces cambios en Claude Code
2. Commiteas a tu rama claude/...
3. Haces merge a master desde tu PC
4. Pusheas a master
5. 🎉 GitHub Actions hace TODO automáticamente:
   - Se conecta al VPS por SSH
   - Hace git fetch origin master
   - Aplica los cambios con git reset --hard
   - Muestra el resultado en los logs
```

---

## 🛠️ Troubleshooting

### Si el Deploy Falla

**1. Verificar que el secreto esté configurado:**
- Ve a Settings → Secrets and variables → Actions
- Debe existir un secreto llamado `DEPLOY_KEY`

**2. Verificar la clave SSH en el VPS:**
```bash
ssh root@srv777726.hstgr.cloud
cat ~/.ssh/authorized_keys
```

Debe contener la clave pública que corresponde a `deploy_key.pub`

**3. Ver los logs del workflow:**
- Ve a la pestaña Actions en GitHub
- Haz clic en el workflow fallido
- Lee los logs para identificar el error

### Si Quieres Desactivar el Deploy Automático

Simplemente renombra o elimina el archivo `.github/workflows/deploy.yml`

---

## 🎯 Alternativa: Deploy Manual con Script

Si no quieres usar GitHub Actions, puedes usar el script manual:

```bash
./DESPLEGAR_MANUAL.sh
```

O seguir las instrucciones en `INSTRUCCIONES_DESPLIEGUE.md`

---

## ⚡ Resumen Ejecutivo

**Para activar el deploy automático:**
1. Copia el contenido de `deploy_key`
2. Ve a GitHub → Settings → Secrets and variables → Actions
3. Crea un secreto llamado `DEPLOY_KEY` con el contenido de la clave
4. ¡Listo! El próximo push a master se desplegará automáticamente

**Beneficio:**
- Ahorras tiempo: No más SSH manual al VPS
- Menos errores: El proceso es consistente
- Logs disponibles: Puedes ver qué se desplegó y cuándo
