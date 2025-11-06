# 🚀 INSTRUCCIONES PARA DESPLEGAR LOS CAMBIOS

## Problema Detectado
Los cambios están en la rama **master** del repositorio Git, pero no se reflejaron en el sitio web porque el despliegue automático de GitHub Actions no se ejecutó correctamente.

## Solución: Despliegue Manual

Ejecuta estos comandos **desde tu terminal local** (no desde este entorno):

### Paso 1: Conectarte al VPS

```bash
ssh root@srv777726.hstgr.cloud
```

**Contraseña:** `Racingcampeon2025#`

### Paso 2: Una vez conectado al VPS, ejecuta estos comandos:

```bash
# Ir al directorio del proyecto
cd /var/www/beristainAsociados

# Ver el estado actual
git status

# Descargar los últimos cambios de master
git fetch origin master

# Aplicar los cambios (esto sobrescribirá cualquier cambio local)
git reset --hard origin/master

# Verificar que se aplicaron los cambios
git log -1 --oneline
```

### Paso 3: Verificar que los archivos nuevos existen

```bash
# Verificar archivos clave
ls -l frontend/js/modules/smoothScroll.js
ls -l frontend/politica-privacidad.html
ls -l INSTRUCCIONES_GOOGLE_ADS.md

# Verificar que el botón de WhatsApp está en el código
grep -c "whatsapp-float" frontend/index.html
```

Si ese último comando devuelve un número mayor a 0, ¡el botón de WhatsApp está en el código!

### Paso 4: Salir del VPS

```bash
exit
```

### Paso 5: Verificar en el navegador

1. Abre tu sitio web: **https://www.beristainyasociados.com.ar**
2. **Limpia la caché del navegador:**
   - **Chrome/Edge:** Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
   - **Firefox:** Presiona `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)
3. O abre el sitio en **modo incógnito** para ver los cambios sin caché

## ✅ Cambios que Deberías Ver

1. **Botón flotante de WhatsApp** en la esquina inferior derecha (verde, con animación de pulso)
2. **Modal de contacto rediseñado** con 4 opciones en cuadrícula:
   - WhatsApp (verde)
   - Teléfono (azul)
   - Email (dorado)
   - Formulario (azul oscuro)
3. **Banner de emergencia** con diseño amarillo (en lugar del rojo anterior)
4. **Efectos de hover mejorados** en las tarjetas y botones
5. **Desplazamiento suave** al hacer clic en los enlaces del menú

## 🔍 Verificar que Google Ads está Activo

Abre las **Herramientas de Desarrollador** del navegador (F12) y ve a la pestaña **Network**. Busca una petición a:
```
www.googletagmanager.com/gtag/js?id=AW-11107730225
```

Si ves esa petición, ¡Google Ads está funcionando!

## ❓ Si Algo Sale Mal

Si después de hacer esto no ves los cambios:

1. Verifica que los comandos en el VPS no dieron ningún error
2. Asegúrate de haber limpiado la caché del navegador
3. Espera 2-3 minutos (a veces el CDN tarda en actualizar)
4. Prueba desde otro dispositivo o red

---

## 📝 Nota sobre GitHub Actions

Para que el despliegue automático funcione en el futuro, necesitas verificar que:

1. El secreto `DEPLOY_KEY` esté configurado en GitHub:
   - Ve a: Repositorio → Settings → Secrets and variables → Actions
   - Verifica que existe un secreto llamado `DEPLOY_KEY`

2. Si no existe, créalo con el contenido del archivo `deploy_key` de este repositorio

3. O configura autenticación por contraseña en el workflow (menos seguro pero más simple)
