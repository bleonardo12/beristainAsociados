# Cómo Verificar el Estado del Despliegue

## 🔍 Métodos de Verificación

### 1. Ver el Registro del Último Despliegue

```bash
# Ver las últimas 50 líneas del log de despliegue
tail -50 /tmp/git_deploy_log.txt

# O buscar solo los despliegues exitosos
grep "Despliegue completado" /tmp/git_deploy_log.txt | tail -5
```

**Busca:** La línea `"Despliegue completado."` con la fecha/hora más reciente.

---

### 2. Ver el Commit Actualmente Desplegado

```bash
# Ver qué commit está desplegado actualmente
cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt

# Ver cuándo fue el último despliegue
cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt
```

---

### 3. Comparar con el Repositorio

```bash
# Ver el último commit en el repositorio
git --git-dir=/home/usuario/beristainAsociados log -1 --oneline

# Comparar con el commit desplegado
DEPLOYED=$(cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt)
LATEST=$(git --git-dir=/home/usuario/beristainAsociados rev-parse HEAD)

echo "Commit desplegado: $DEPLOYED"
echo "Último commit:     $LATEST"

if [ "$DEPLOYED" = "$LATEST" ]; then
  echo "✓ El sitio está actualizado con el último commit"
else
  echo "⚠ El sitio NO está actualizado. Hay commits nuevos sin desplegar"
fi
```

---

### 4. Verificar Encabezados HTTP

```bash
# Ver la fecha de última modificación del servidor web
curl -I https://beristainyasociados.com.ar/index.html | grep -i "last-modified"

# O ver todos los encabezados
curl -I https://beristainyasociados.com.ar/index.html
```

**Busca:** El valor de `Last-Modified` - debe coincidir con la hora del último despliegue.

---

### 5. Verificar Timestamp del index.html

```bash
# Ver la fecha de modificación del archivo
stat /var/www/beristainAsociados/frontend/index.html | grep Modify

# O de forma más simple
ls -lh /var/www/beristainAsociados/frontend/index.html
```

---

### 6. Verificar Contenido Específico

Si hiciste cambios específicos en el HTML/CSS/JS, puedes buscarlos:

```bash
# Buscar un texto específico en el index.html desplegado
grep "texto-que-agregaste" /var/www/beristainAsociados/frontend/index.html

# O ver el contenido completo
cat /var/www/beristainAsociados/frontend/index.html | less
```

---

### 7. Verificar en el Navegador

#### Método A: Forzar Recarga Completa
1. Abre: https://beristainyasociados.com.ar
2. Presiona: **Ctrl + Shift + R** (Windows/Linux) o **Cmd + Shift + R** (Mac)
3. Esto ignora la caché del navegador y descarga todo de nuevo

#### Método B: Usar Modo Incógnito
1. Abre una ventana de incógnito/privada
2. Visita: https://beristainyasociados.com.ar
3. El navegador no usará caché anterior

#### Método C: Ver el código fuente
1. Click derecho → "Ver código fuente de la página"
2. Busca tus cambios específicos en el HTML

---

### 8. Script de Verificación Completa

Crea este script para verificar todo de una vez:

```bash
#!/bin/bash
echo "=== VERIFICACIÓN DE DESPLIEGUE ==="
echo ""

echo "1. Último despliegue exitoso:"
grep "Despliegue completado" /tmp/git_deploy_log.txt | tail -1
echo ""

echo "2. Commit desplegado:"
cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt 2>/dev/null || echo "No disponible"
echo ""

echo "3. Fecha del despliegue:"
cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt 2>/dev/null || echo "No disponible"
echo ""

echo "4. Último commit en el repositorio:"
git --git-dir=/home/usuario/beristainAsociados log -1 --oneline 2>/dev/null || echo "No disponible"
echo ""

echo "5. Fecha de modificación del index.html:"
stat -c "Modificado: %y" /var/www/beristainAsociados/frontend/index.html 2>/dev/null || echo "No disponible"
echo ""

echo "6. Last-Modified del servidor web:"
curl -sI https://beristainyasociados.com.ar/index.html | grep -i "last-modified" || echo "No disponible"
echo ""

echo "=== FIN DE VERIFICACIÓN ==="
```

Guarda esto como `/tmp/verificar_deploy.sh` y ejecútalo:
```bash
chmod +x /tmp/verificar_deploy.sh
/tmp/verificar_deploy.sh
```

---

## 🔄 Si los Cambios NO Aparecen

Si después de verificar ves que los cambios no se aplicaron:

### A. Ejecutar el Hook Manualmente
```bash
echo "" | /home/usuario/beristainAsociados/hooks/post-receive
tail -20 /tmp/git_deploy_log.txt
```

### B. Limpiar Caché de Nginx (si aplica)
```bash
# Recargar configuración de Nginx
nginx -s reload

# O reiniciar Nginx
systemctl restart nginx
```

### C. Verificar Permisos
```bash
ls -la /var/www/beristainAsociados/frontend/
# Debe mostrar propietario www-data:www-data
```

### D. Ver Errores en el Log
```bash
# Ver todo el log completo
cat /tmp/git_deploy_log.txt

# Ver solo errores
grep -i "error\|fail" /tmp/git_deploy_log.txt
```

---

## 📱 Verificación Rápida (Una Línea)

Para verificar rápidamente si está actualizado:

```bash
echo "Desplegado: $(cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt 2>/dev/null || echo 'N/A')" && curl -sI https://beristainyasociados.com.ar/index.html | grep -i "last-modified"
```
