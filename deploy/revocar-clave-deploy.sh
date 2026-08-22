#!/bin/bash
# Revoca la clave de deploy de beristainAsociados del authorized_keys de root.
#
# Por qué: esa clave privada vive en los secretos de un repositorio PÚBLICO y
# da acceso root irrestricto a un servidor con cuatro sitios. Ya no hace falta:
# desde que el VPS trae los cambios por cron (deploy/auto-pull.sh), GitHub no
# necesita entrar por SSH para publicar.
#
# El script NO toca ninguna otra clave y aborta si algo no cuadra.
# Se ejecuta EN el VPS:  bash /var/www/beristainAsociados/deploy/revocar-clave-deploy.sh
set -e

AK=/root/.ssh/authorized_keys
BACKUP=/root/backup-authorized_keys-$(date +%Y%m%d-%H%M%S)
CLAVE="deploy@beristainAsociados"
PERSONAL="beristain.lbc@gmail.com"

[ -f "$AK" ] || { echo "No se encontró $AK"; exit 1; }

echo "=== Verificación previa ==="

# 1) El cron de deploy debe estar activo, o quedaríamos sin forma de publicar.
if ! crontab -l 2>/dev/null | grep -q "auto-pull.sh"; then
  echo "ABORTA: el cron de deploy no está instalado."
  echo "Sin él, revocar esta clave te deja sin forma de publicar."
  exit 1
fi
echo "  cron de deploy activo ................ OK"

# 2) El script de deploy debe existir.
[ -f /var/www/beristainAsociados/deploy/auto-pull.sh ] || {
  echo "ABORTA: falta deploy/auto-pull.sh"; exit 1; }
echo "  script de deploy presente ............ OK"

# 3) Tu clave personal debe estar, o perderíamos el acceso.
if ! grep -q "$PERSONAL" "$AK"; then
  echo "ABORTA: no se encontró la clave personal ($PERSONAL)."
  echo "Sin ella no habría cómo volver a entrar. No se toca nada."
  exit 1
fi
echo "  clave personal presente .............. OK"

# 4) La clave a revocar debe existir (si no, ya está hecho).
if ! grep -q "$CLAVE" "$AK"; then
  echo ""
  echo "La clave $CLAVE ya no está. Nada que hacer."
  exit 0
fi

ANTES=$(grep -c . "$AK")
cp "$AK" "$BACKUP"
chmod 600 "$BACKUP"
echo "  respaldo ............................. $BACKUP"

echo ""
echo "=== Revocando ==="
grep -v "$CLAVE" "$AK" > /tmp/ak.nuevo
DESPUES=$(grep -c . /tmp/ak.nuevo)

# Solo debe haberse ido UNA línea, y la personal debe seguir.
if [ "$DESPUES" -ne "$((ANTES - 1))" ]; then
  echo "ABORTA: se habrían quitado $((ANTES - DESPUES)) claves en lugar de 1."
  rm -f /tmp/ak.nuevo
  exit 1
fi
if ! grep -q "$PERSONAL" /tmp/ak.nuevo; then
  echo "ABORTA: el resultado no conserva tu clave personal."
  rm -f /tmp/ak.nuevo
  exit 1
fi

cat /tmp/ak.nuevo > "$AK"
rm -f /tmp/ak.nuevo
chmod 600 "$AK"

echo "  claves: $ANTES -> $DESPUES"
echo ""
echo "=== Claves que quedaron ==="
awk '{print "  " $NF}' "$AK"
echo ""
echo "Listo. Para revertir:  cp $BACKUP $AK"
echo "IMPORTANTE: no cierres esta sesión hasta comprobar en OTRA terminal que podés entrar."
