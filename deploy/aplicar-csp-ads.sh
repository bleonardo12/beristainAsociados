#!/bin/bash
# Habilita los dominios de conversión de Google Ads en el CSP del bloque server.
#
# Por qué: el CSP general solo autoriza Tag Manager y Analytics. Google Ads
# registra las conversiones desde googleadservices.com y doubleclick.net, así
# que el navegador las bloquea antes de que lleguen. Las páginas heredadas
# (landing*, login, causas…) ya tienen su propia política amplia y no se tocan.
#
# Se ejecuta EN el VPS:  sudo bash /var/www/beristainAsociados/deploy/aplicar-csp-ads.sh
set -e

VHOST=/etc/nginx/sites-enabled/beristainyasociados.com.ar
BACKUP=/root/backup-vhost-csp-$(date +%Y%m%d-%H%M%S).conf

if [ ! -f "$VHOST" ]; then
  echo "No se encontró $VHOST"; exit 1
fi

# La línea del CSP del bloque server es la única que menciona openstreetmap.
LINEA=$(grep -n "Content-Security-Policy" "$VHOST" | grep "openstreetmap" | cut -d: -f1 | head -1)
if [ -z "$LINEA" ]; then
  echo "No se encontró el CSP del bloque server. ¿Ya fue modificado?"; exit 1
fi
echo "CSP del server encontrado en la línea $LINEA"

if sed -n "${LINEA}p" "$VHOST" | grep -q "googleadservices"; then
  echo "El CSP ya incluye los dominios de Ads. No hay nada que hacer."; exit 0
fi

cp "$VHOST" "$BACKUP"
echo "Respaldo: $BACKUP"

sed -i "${LINEA}s|https://\*\.googletagmanager\.com; connect-src|https://*.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net; connect-src|" "$VHOST"
sed -i "${LINEA}s|https://formsubmit\.co; style-src|https://formsubmit.co https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com; style-src|" "$VHOST"
sed -i "${LINEA}s|img-src 'self' data: https://\*\.google-analytics\.com https://www\.googletagmanager\.com;|img-src 'self' data: https:;|" "$VHOST"
sed -i "${LINEA}s|frame-src https://www\.openstreetmap\.org;|frame-src https://www.openstreetmap.org https://td.doubleclick.net https://www.googletagmanager.com;|" "$VHOST"

echo "--- validando configuración ---"
if ! nginx -t; then
  echo "Configuración inválida. Restaurando el respaldo."
  cp "$BACKUP" "$VHOST"
  exit 1
fi

systemctl reload nginx
echo ""
echo "CSP aplicado. Dominios habilitados:"
sed -n "${LINEA}p" "$VHOST" | grep -o "googleadservices[^ ;]*\|doubleclick[^ ;]*" | sort -u | sed 's/^/  /'
