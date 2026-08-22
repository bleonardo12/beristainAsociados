#!/bin/bash
# Hace que el dominio sin www redirija al dominio con www.
#
# Por qué: hoy el sitio responde 200 en los DOS dominios con el mismo
# contenido. Analytics no registra visitas en el dominio sin www —así que
# hoy no rompe nada— pero mientras siga así, cualquier enlace o anuncio que
# apunte al dominio pelado abre una segunda versión del sitio: sesión aparte,
# cookies aparte y conversiones que Ads no puede unir con el clic original.
# El <link rel="canonical"> de todas las páginas ya declara la versión con www.
#
# Se ejecuta EN el VPS:  bash /var/www/beristainAsociados/deploy/aplicar-redirect-www.sh
set -e

CONF=$(ls /etc/nginx/sites-available/ | grep -i beristain | head -1)
[ -n "$CONF" ] || { echo "No se encontró la configuración de nginx."; exit 1; }
RUTA="/etc/nginx/sites-available/$CONF"
BACKUP="/root/backup-nginx-$CONF-$(date +%Y%m%d-%H%M%S)"

echo "Configuración: $RUTA"

if grep -q "redirect-www-beristain" "$RUTA"; then
  echo "El redirect ya está aplicado. No se hace nada."
  exit 0
fi

cp "$RUTA" "$BACKUP"
echo "Respaldo: $BACKUP"

# El bloque nuevo atiende SOLO al dominio pelado en 443 y redirige.
# No toca el bloque existente, que sigue sirviendo el dominio con www.
cat >> "$RUTA" <<'BLOQUE'

# redirect-www-beristain
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name beristainyasociados.com.ar;

    ssl_certificate     /etc/letsencrypt/live/beristainyasociados.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beristainyasociados.com.ar/privkey.pem;

    return 301 https://www.beristainyasociados.com.ar$request_uri;
}
BLOQUE

# Si la configuración no valida, se revierte sola: el sitio nunca queda caído.
if ! nginx -t 2>&1 | tail -2; then
  echo ""
  echo "La configuración no valida. Se revierte y no se toca nada."
  cp "$BACKUP" "$RUTA"
  exit 1
fi

systemctl reload nginx
echo ""
echo "Aplicado. Comprobación:"
curl -s -o /dev/null -w "  sin www -> %{http_code} %{redirect_url}\n" https://beristainyasociados.com.ar/penal.html
curl -s -o /dev/null -w "  con www -> %{http_code}\n" https://www.beristainyasociados.com.ar/penal.html
echo ""
echo "Para revertir:  cp $BACKUP $RUTA && nginx -t && systemctl reload nginx"
