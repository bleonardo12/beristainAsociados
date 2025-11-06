#!/bin/bash
# Script para verificar el estado del despliegue web

echo "=========================================="
echo "   VERIFICACIÓN DE DESPLIEGUE WEB"
echo "=========================================="
echo ""

# 1. Último despliegue exitoso
echo "📋 1. Último despliegue registrado:"
if [ -f /tmp/git_deploy_log.txt ]; then
  LAST_DEPLOY=$(grep "Hook ejecutado:" /tmp/git_deploy_log.txt | tail -1)
  if [ -n "$LAST_DEPLOY" ]; then
    echo "   $LAST_DEPLOY"
    echo -n "   Estado: "
    if grep -q "Despliegue completado" /tmp/git_deploy_log.txt | tail -1; then
      echo "✓ COMPLETADO"
    else
      echo "⚠ INCOMPLETO O CON ERRORES"
    fi
  else
    echo "   ⚠ No hay registros de despliegue"
  fi
else
  echo "   ⚠ Archivo de log no existe"
fi
echo ""

# 2. Commit desplegado
echo "🔖 2. Commit actualmente desplegado:"
if [ -f /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt ]; then
  DEPLOYED_COMMIT=$(cat /var/www/beristainAsociados/frontend/DEPLOY_COMMIT.txt)
  echo "   $DEPLOYED_COMMIT"
else
  echo "   ⚠ No se encontró el archivo DEPLOY_COMMIT.txt"
  DEPLOYED_COMMIT=""
fi
echo ""

# 3. Fecha del despliegue
echo "🕐 3. Fecha del último despliegue:"
if [ -f /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt ]; then
  cat /var/www/beristainAsociados/frontend/DEPLOY_TIME.txt | sed 's/^/   /'
else
  echo "   ⚠ No se encontró el archivo DEPLOY_TIME.txt"
fi
echo ""

# 4. Último commit en el repositorio
echo "📦 4. Último commit en el repositorio:"
if [ -d /home/usuario/beristainAsociados ]; then
  # Intentar obtener todas las ramas y sus últimos commits
  echo "   Ramas disponibles:"
  git --git-dir=/home/usuario/beristainAsociados for-each-ref --format='     - %(refname:short): %(objectname:short) - %(subject)' refs/heads/ 2>/dev/null

  # Obtener HEAD si existe
  if git --git-dir=/home/usuario/beristainAsociados rev-parse HEAD >/dev/null 2>&1; then
    LATEST_COMMIT=$(git --git-dir=/home/usuario/beristainAsociados rev-parse HEAD)
    echo ""
    echo "   HEAD actual: $LATEST_COMMIT"
  fi
else
  echo "   ⚠ No se encontró el repositorio bare"
fi
echo ""

# 5. Comparación
if [ -n "$DEPLOYED_COMMIT" ] && [ -d /home/usuario/beristainAsociados ]; then
  echo "🔄 5. Estado de sincronización:"

  # Buscar el commit desplegado en alguna rama
  FOUND=false
  for branch in $(git --git-dir=/home/usuario/beristainAsociados for-each-ref --format='%(refname:short)' refs/heads/); do
    BRANCH_COMMIT=$(git --git-dir=/home/usuario/beristainAsociados rev-parse $branch 2>/dev/null)
    if [ "$DEPLOYED_COMMIT" = "$BRANCH_COMMIT" ]; then
      echo "   ✓ El sitio está actualizado con la rama: $branch"
      FOUND=true
      break
    fi
  done

  if [ "$FOUND" = false ]; then
    echo "   ⚠ El commit desplegado no coincide con ninguna rama HEAD"
    echo "   Puede que haya commits más nuevos disponibles"
  fi
  echo ""
fi

# 6. Fecha de modificación del index.html
echo "📄 6. Archivo index.html desplegado:"
if [ -f /var/www/beristainAsociados/frontend/index.html ]; then
  stat -c "   Tamaño: %s bytes" /var/www/beristainAsociados/frontend/index.html 2>/dev/null
  stat -c "   Modificado: %y" /var/www/beristainAsociados/frontend/index.html 2>/dev/null
  stat -c "   Propietario: %U:%G" /var/www/beristainAsociados/frontend/index.html 2>/dev/null
else
  echo "   ⚠ No se encontró /var/www/beristainAsociados/frontend/index.html"
fi
echo ""

# 7. Last-Modified del servidor web
echo "🌐 7. Encabezados HTTP del servidor web:"
LAST_MODIFIED=$(curl -sI https://beristainyasociados.com.ar/index.html 2>/dev/null | grep -i "last-modified")
if [ -n "$LAST_MODIFIED" ]; then
  echo "   $LAST_MODIFIED"

  HTTP_STATUS=$(curl -sI https://beristainyasociados.com.ar/index.html 2>/dev/null | head -1)
  echo "   Estado HTTP: $HTTP_STATUS"
else
  echo "   ⚠ No se pudo obtener información del servidor web"
  echo "   Verifica que el sitio esté accesible: https://beristainyasociados.com.ar"
fi
echo ""

# 8. Resumen
echo "=========================================="
echo "   RESUMEN"
echo "=========================================="
echo ""

# Verificar si hay errores recientes en el log
if [ -f /tmp/git_deploy_log.txt ]; then
  RECENT_ERRORS=$(tail -50 /tmp/git_deploy_log.txt | grep -i "error\|fatal\|fail" | head -3)
  if [ -n "$RECENT_ERRORS" ]; then
    echo "⚠️  ERRORES ENCONTRADOS en el log:"
    echo "$RECENT_ERRORS" | sed 's/^/   /'
    echo ""
  fi
fi

# Dar recomendaciones
echo "💡 RECOMENDACIONES:"
echo ""
echo "   • Para ver el log completo:"
echo "     tail -100 /tmp/git_deploy_log.txt"
echo ""
echo "   • Para forzar un nuevo despliegue:"
echo "     echo '' | /home/usuario/beristainAsociados/hooks/post-receive"
echo ""
echo "   • Para verificar en el navegador (sin caché):"
echo "     Ctrl + Shift + R (o Cmd + Shift + R en Mac)"
echo ""
echo "=========================================="
