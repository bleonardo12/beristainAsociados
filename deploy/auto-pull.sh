#!/bin/bash
# Trae a producción lo que esté publicado en master.
#
# Por qué existe: el deploy por GitHub Actions falla de forma intermitente
# porque los runners entran por SSH al VPS y esa conexión se corta en la red
# —el servidor no registra ni un intento, así que el filtrado es del lado del
# hosting hacia los rangos de datacenter—. Este script invierte la dirección:
# el VPS consulta a GitHub (tráfico saliente, siempre permitido) en lugar de
# que GitHub entre al VPS.
#
# Se instala en cron:
#   */2 * * * * /bin/bash /var/www/beristainAsociados/deploy/auto-pull.sh
set -e

REPO=/var/www/beristainAsociados
LOG=/var/log/beristain-deploy.log

cd "$REPO" || exit 1

ANTES=$(git rev-parse HEAD)
git fetch origin master -q || exit 0
DESPUES=$(git rev-parse origin/master)

# Sin cambios: no hace nada y no ensucia el log.
[ "$ANTES" = "$DESPUES" ] && exit 0

git reset --hard origin/master -q
echo "$(date '+%F %T')  ${ANTES:0:7} -> ${DESPUES:0:7}  $(git log -1 --format=%s)" >> "$LOG"
