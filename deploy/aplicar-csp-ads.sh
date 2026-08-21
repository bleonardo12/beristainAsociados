#!/bin/bash
# Escribe la política de seguridad de contenido del bloque server con todos
# los dominios que Google Ads necesita para registrar conversiones.
#
# La versión anterior de este script se quedaba corta. Probando una conversión
# real en el navegador aparecieron tres destinos más que el CSP bloqueaba:
#   - ad.doubleclick.net y stats.g.doubleclick.net (no solo googleads.g.)
#   - www.google.com.ar: Google usa el dominio del país del visitante para el
#     endpoint 1p-conversion, así que listar solo www.google.com no alcanza.
# Por eso ahora se reemplaza la línea completa en lugar de parchearla.
#
# Se ejecuta EN el VPS:  bash /var/www/beristainAsociados/deploy/aplicar-csp-ads.sh
set -e

VHOST=/etc/nginx/sites-enabled/beristainyasociados.com.ar
BACKUP=/root/backup-vhost-csp-$(date +%Y%m%d-%H%M%S).conf

[ -f "$VHOST" ] || { echo "No se encontró $VHOST"; exit 1; }

# La línea del CSP del bloque server es la única que menciona openstreetmap.
LINEA=$(grep -n "Content-Security-Policy" "$VHOST" | grep "openstreetmap" | cut -d: -f1 | head -1)
[ -n "$LINEA" ] || { echo "No se encontró el CSP del bloque server."; exit 1; }
echo "CSP del server en la línea $LINEA"

CSP="    add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google-analytics.com; connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.googleadservices.com https://*.doubleclick.net https://www.google.com https://www.google.com.ar https://google.com.ar https://formsubmit.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.openstreetmap.org https://td.doubleclick.net https://www.googletagmanager.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://formsubmit.co\" always;"

cp "$VHOST" "$BACKUP"
echo "Respaldo: $BACKUP"

awk -v n="$LINEA" -v repl="$CSP" 'NR==n{print repl; next}{print}' "$VHOST" > /tmp/vhost.nuevo
mv /tmp/vhost.nuevo "$VHOST"

echo "--- validando configuración ---"
if ! nginx -t 2>&1 | grep -q "test is successful"; then
  echo "Configuración inválida. Restaurando el respaldo."
  cp "$BACKUP" "$VHOST"
  nginx -t
  exit 1
fi

systemctl reload nginx
echo ""
echo "CSP aplicado. Dominios de Ads habilitados en connect-src:"
sed -n "${LINEA}p" "$VHOST" | grep -oE "https://[a-z*.]*(doubleclick|googleadservices|google)\.[a-z.]+" | sort -u | sed 's/^/  /'
