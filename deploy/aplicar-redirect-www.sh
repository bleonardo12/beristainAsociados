#!/bin/bash
# Hace que el dominio sin www redirija al dominio con www, y de paso ordena
# la configuración de nginx de este sitio.
#
# Por qué el redirect: hoy el sitio responde 200 en los DOS dominios con el
# mismo contenido. Analytics no registra visitas en el dominio pelado, así que
# hoy no rompe nada, pero cualquier enlace o anuncio que apunte ahí abriría una
# segunda versión del sitio: sesión aparte, cookies aparte y conversiones que
# Ads no puede unir con el clic original. El <link rel="canonical"> de todas
# las páginas ya declara la versión con www.
#
# Por qué el orden: en TODOS los sitios del servidor, sites-enabled/<sitio> es
# un enlace a sites-available/<sitio>. En este NO: es un archivo aparte, y los
# dos ya divergieron —los cambios de CSP y de redirects de agosto están solo en
# el de sites-enabled—. Quien edite sites-available, que es el lugar donde uno
# los busca, no va a ver ningún efecto y no va a entender por qué. El script
# deja el archivo bueno en sites-available y vuelve a enlazar sites-enabled.
#
# Se ejecuta EN el VPS:  bash /var/www/beristainAsociados/deploy/aplicar-redirect-www.sh
set -e

SITIO=beristainyasociados.com.ar
ENABLED=/etc/nginx/sites-enabled/$SITIO
AVAILABLE=/etc/nginx/sites-available/$SITIO
SELLO=$(date +%Y%m%d-%H%M%S)
BK_ENABLED=/root/backup-nginx-enabled-$SITIO-$SELLO
BK_AVAILABLE=/root/backup-nginx-available-$SITIO-$SELLO

[ -f "$ENABLED" ] || { echo "No se encontró $ENABLED"; exit 1; }

echo "=== Estado previo ==="
if [ -L "$ENABLED" ]; then
  echo "  sites-enabled ya es un enlace; solo se agrega el redirect."
  YA_ENLACE=1
else
  echo "  sites-enabled es un archivo aparte (se va a reordenar)."
  YA_ENLACE=0
fi

if grep -q "redirect-www-beristain" "$ENABLED"; then
  echo "  El redirect ya está aplicado."
  YA_REDIRECT=1
else
  YA_REDIRECT=0
fi

cp "$ENABLED" "$BK_ENABLED"
[ -f "$AVAILABLE" ] && cp "$AVAILABLE" "$BK_AVAILABLE"
echo "  respaldos: $BK_ENABLED"
[ -f "$AVAILABLE" ] && echo "             $BK_AVAILABLE"

# Trabajamos sobre una copia: la configuración viva no se toca hasta validar.
TMP=$(mktemp)
cp "$ENABLED" "$TMP"

if [ "$YA_REDIRECT" -eq 0 ]; then
  cat >> "$TMP" <<'BLOQUE'

# redirect-www-beristain
# Atiende SOLO al dominio sin www. nginx elige el server_name más específico,
# así que este bloque gana sobre el de arriba, que declara los dos nombres.
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name beristainyasociados.com.ar;

    ssl_certificate     /etc/letsencrypt/live/beristainyasociados.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beristainyasociados.com.ar/privkey.pem;

    return 301 https://www.beristainyasociados.com.ar$request_uri;
}
BLOQUE
fi

echo ""
echo "=== Aplicando ==="
cp "$TMP" "$AVAILABLE"
if [ "$YA_ENLACE" -eq 0 ]; then
  rm -f "$ENABLED"
  ln -s "$AVAILABLE" "$ENABLED"
  echo "  sites-enabled -> enlace a sites-available"
else
  cp "$TMP" "$ENABLED"
fi
rm -f "$TMP"

if ! nginx -t 2>&1 | tail -2; then
  echo ""
  echo "La configuración no valida. Se revierte todo."
  rm -f "$ENABLED"
  cp "$BK_ENABLED" "$ENABLED"
  [ -f "$BK_AVAILABLE" ] && cp "$BK_AVAILABLE" "$AVAILABLE"
  exit 1
fi

systemctl reload nginx
sleep 2

echo ""
echo "=== Comprobación ==="
curl -s -o /dev/null -w "  sin www -> %{http_code}  %{redirect_url}\n" https://beristainyasociados.com.ar/penal.html
curl -s -o /dev/null -w "  con www -> %{http_code}\n" https://www.beristainyasociados.com.ar/penal.html
ls -la "$ENABLED"
echo ""
echo "Para revertir:"
echo "  rm -f $ENABLED && cp $BK_ENABLED $ENABLED && nginx -t && systemctl reload nginx"
