# Instrucciones de Instalación del Hook

Tienes **3 opciones** para instalar el hook en el servidor:

---

## Opción 1: Usar el Script de Instalación (MÁS FÁCIL)

Ya estás conectado al servidor como `root@srv777726`. Copia y pega estos comandos directamente:

```bash
# Crear el script instalador
cat > /tmp/instalar-hook.sh << 'EOF'
#!/bin/bash
set -e

HOOK_DEST="/home/usuario/beristainAsociados/hooks/post-receive"
mkdir -p "$(dirname "$HOOK_DEST")"

cat > "$HOOK_DEST" << 'HOOK_EOF'
#!/bin/bash
set -eu

REPO="/home/usuario/beristainAsociados"
DEST="/var/www/beristainAsociados/frontend"
LOG="/tmp/git_deploy_log.txt"

read oldrev newrev ref || true

{
  echo "============================="
  echo "Hook ejecutado: $(date)"
  echo "oldrev: ${oldrev:-N/A}"
  echo "newrev: ${newrev:-N/A}"
  echo "ref:    ${ref:-N/A}"
  echo "Destino: $DEST"

  mkdir -p "$DEST"

  if [ -z "${newrev:-}" ] || ! git --git-dir="$REPO" cat-file -e "${newrev}^{commit}" 2>/dev/null; then
    echo "newrev no válido o vacío, buscando branch por defecto..."

    if git --git-dir="$REPO" rev-parse --verify -q refs/heads/main >/dev/null 2>&1; then
      newrev="$(git --git-dir="$REPO" rev-parse refs/heads/main)"
      echo "newrev tomado de refs/heads/main: $newrev"
    elif git --git-dir="$REPO" rev-parse --verify -q refs/heads/master >/dev/null 2>&1; then
      newrev="$(git --git-dir="$REPO" rev-parse refs/heads/master)"
      echo "newrev tomado de refs/heads/master: $newrev"
    else
      default_branch=$(git --git-dir="$REPO" symbolic-ref HEAD 2>/dev/null | sed 's,refs/heads/,,') || default_branch=""

      if [ -n "$default_branch" ] && git --git-dir="$REPO" rev-parse --verify -q "refs/heads/$default_branch" >/dev/null 2>&1; then
        newrev="$(git --git-dir="$REPO" rev-parse "refs/heads/$default_branch")"
        echo "newrev tomado de refs/heads/$default_branch: $newrev"
      else
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

  if git --git-dir="$REPO" ls-tree -r --name-only "$newrev" | grep -q '^frontend/'; then
    echo "Exportando SOLO 'frontend/'..."
    git --git-dir="$REPO" archive --format=tar "$newrev" frontend/ \
      | tar -x -C "$DEST" --strip-components=1
  else
    echo "No hay 'frontend/' en el commit. Exportando RAÍZ completa..."
    git --git-dir="$REPO" archive --format=tar "$newrev" \
      | tar -x -C "$DEST"
  fi

  find "$DEST" -type f -name 'index.html' -exec touch {} +
  chown -R www-data:www-data "$DEST"
  chmod -R 755 "$DEST"

  echo "$newrev" > "$DEST/DEPLOY_COMMIT.txt"
  date > "$DEST/DEPLOY_TIME.txt"

  echo "Despliegue completado."
  echo "============================="
} >> "$LOG" 2>&1
HOOK_EOF

chmod +x "$HOOK_DEST"
echo "✓ Hook instalado en: $HOOK_DEST"
EOF

# Ejecutar el instalador
chmod +x /tmp/instalar-hook.sh
/tmp/instalar-hook.sh
```

---

## Opción 2: Desde tu Máquina Local (si tienes acceso SSH)

Si estás en tu máquina local y tienes acceso SSH al servidor:

```bash
# Desde tu repositorio local, ejecuta:
scp /home/user/beristainAsociados/hooks/post-receive usuario@srv777726:/tmp/
ssh usuario@srv777726 "sudo mv /tmp/post-receive /home/usuario/beristainAsociados/hooks/post-receive && sudo chmod +x /home/usuario/beristainAsociados/hooks/post-receive"
```

---

## Opción 3: Usando Git (si el servidor tiene acceso al repositorio)

Si el servidor puede acceder al repositorio de GitHub:

```bash
# En el servidor:
cd /tmp
git clone https://github.com/bleonardo12/beristainAsociados.git
cd beristainAsociados
git checkout claude/fix-git-deploy-hook-011CUrm1UDNTmUj99v8WoNep
cp hooks/post-receive /home/usuario/beristainAsociados/hooks/
chmod +x /home/usuario/beristainAsociados/hooks/post-receive
cd ..
rm -rf beristainAsociados
```

---

## Verificación de la Instalación

Después de instalar por cualquier método, verifica que funciona:

```bash
# Ver qué ramas hay disponibles
git --git-dir=/home/usuario/beristainAsociados for-each-ref --format='%(refname:short)' refs/heads/

# Probar el hook manualmente
echo "" | /home/usuario/beristainAsociados/hooks/post-receive

# Ver el registro del despliegue
tail -50 /tmp/git_deploy_log.txt

# Verificar que index.html se actualizó
stat /var/www/beristainAsociados/frontend/index.html

# Verificar encabezados HTTP
curl -I https://beristainyasociados.com.ar/index.html
```

Si ves `"Despliegue completado."` en el log, ¡el hook está funcionando correctamente!
