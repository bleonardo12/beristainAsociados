#!/bin/bash
# Script de instalación del hook post-receive mejorado
# Ejecutar este script en el servidor como root o con sudo

set -e

HOOK_DEST="/home/usuario/beristainAsociados/hooks/post-receive"

echo "=== Instalación del Hook de Despliegue ==="
echo ""
echo "Este script instalará el hook post-receive mejorado que:"
echo "  - Detecta automáticamente la rama correcta (main, master, etc.)"
echo "  - Maneja correctamente las ejecuciones manuales"
echo "  - Proporciona mejor registro para depuración"
echo ""

# Crear directorio si no existe
mkdir -p "$(dirname "$HOOK_DEST")"

# Crear el archivo del hook
cat > "$HOOK_DEST" << 'HOOK_EOF'
#!/bin/bash
set -eu

REPO="/home/usuario/beristainAsociados"      # repo bare
DEST="/var/www/beristainAsociados/frontend"   # carpeta que sirve Nginx
LOG="/tmp/git_deploy_log.txt"

# Leer oldrev newrev ref del push (si viene vacío, igual seguimos para pruebas manuales)
read oldrev newrev ref || true

{
  echo "============================="
  echo "Hook ejecutado: $(date)"
  echo "oldrev: ${oldrev:-N/A}"
  echo "newrev: ${newrev:-N/A}"
  echo "ref:    ${ref:-N/A}"
  echo "Destino: $DEST"

  mkdir -p "$DEST"

  # Si newrev no vino por stdin (ejecución manual), intentar detectar el branch correcto
  if [ -z "${newrev:-}" ] || ! git --git-dir="$REPO" cat-file -e "${newrev}^{commit}" 2>/dev/null; then
    echo "newrev no válido o vacío, buscando branch por defecto..."

    # Intentar encontrar el branch por defecto en este orden: main, master, o el primero disponible
    if git --git-dir="$REPO" rev-parse --verify -q refs/heads/main >/dev/null 2>&1; then
      newrev="$(git --git-dir="$REPO" rev-parse refs/heads/main)"
      echo "newrev tomado de refs/heads/main: $newrev"
    elif git --git-dir="$REPO" rev-parse --verify -q refs/heads/master >/dev/null 2>&1; then
      newrev="$(git --git-dir="$REPO" rev-parse refs/heads/master)"
      echo "newrev tomado de refs/heads/master: $newrev"
    else
      # Intentar obtener HEAD simbólico
      default_branch=$(git --git-dir="$REPO" symbolic-ref HEAD 2>/dev/null | sed 's,refs/heads/,,') || default_branch=""

      if [ -n "$default_branch" ] && git --git-dir="$REPO" rev-parse --verify -q "refs/heads/$default_branch" >/dev/null 2>&1; then
        newrev="$(git --git-dir="$REPO" rev-parse "refs/heads/$default_branch")"
        echo "newrev tomado de refs/heads/$default_branch: $newrev"
      else
        # Último recurso: tomar la primera rama disponible
        first_branch=$(git --git-dir="$REPO" for-each-ref --format='%(refname:short)' refs/heads/ | head -n1)

        if [ -n "$first_branch" ]; then
          newrev="$(git --git-dir="$REPO" rev-parse "refs/heads/$first_branch")"
          echo "newrev tomado de la primera rama disponible (refs/heads/$first_branch): $newrev"
        else
          echo "ERROR: No se encontró ningún branch válido en el repositorio. Abortando."
          exit 1
        fi
      fi
    fi
  fi

  echo "Exportando commit $newrev ..."

  # ¿Existe subcarpeta frontend/ en ese commit?
  if git --git-dir="$REPO" ls-tree -r --name-only "$newrev" | grep -q '^frontend/'; then
    echo "Exportando SOLO 'frontend/'..."
    git --git-dir="$REPO" archive --format=tar "$newrev" frontend/ \
      | tar -x -C "$DEST" --strip-components=1
  else
    echo "No hay 'frontend/' en el commit. Exportando RAÍZ completa..."
    git --git-dir="$REPO" archive --format=tar "$newrev" \
      | tar -x -C "$DEST"
  fi

  # Forzar mtime reciente (para que Nginx actualice Last-Modified)
  find "$DEST" -type f -name 'index.html' -exec touch {} +

  # Permisos para Nginx
  chown -R www-data:www-data "$DEST"
  chmod -R 755 "$DEST"

  # Huella del deploy
  echo "$newrev" > "$DEST/DEPLOY_COMMIT.txt"
  date > "$DEST/DEPLOY_TIME.txt"

  echo "Despliegue completado."
  echo "============================="
} >> "$LOG" 2>&1
HOOK_EOF

# Hacer el hook ejecutable
chmod +x "$HOOK_DEST"

echo "✓ Hook instalado correctamente en: $HOOK_DEST"
echo ""
echo "=== Verificación ==="
echo "Ramas disponibles en el repositorio:"
git --git-dir=/home/usuario/beristainAsociados for-each-ref --format='  - %(refname:short)' refs/heads/
echo ""
echo "=== Prueba Manual ==="
echo "Para probar el hook, ejecuta:"
echo "  echo '' | $HOOK_DEST"
echo "  tail -50 /tmp/git_deploy_log.txt"
echo ""
echo "¡Instalación completada!"
