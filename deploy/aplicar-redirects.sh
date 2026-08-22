#!/bin/bash
# Redirige las páginas del sitio anterior a su equivalente actual.
#
# Por qué: seguían marcadas como indexables y hablando de lo mismo que las
# páginas nuevas, así que Google repartía la autoridad entre ambas en lugar
# de concentrarla en la buena. landing-civil, landing-contable y
# landing-accidentes ya redirigían; faltaban estas tres.
#
# honorarios.html no tiene equivalente nuevo, pero responde a la misma
# búsqueda que la guía de honorarios penales: se redirige ahí para no perder
# lo que esa URL tenga acumulado.
#
# Se ejecuta EN el VPS:  bash /var/www/beristainAsociados/deploy/aplicar-redirects.sh
set -e

VHOST=/etc/nginx/sites-enabled/beristainyasociados.com.ar
BACKUP=/root/backup-vhost-redirects-$(date +%Y%m%d-%H%M%S).conf

[ -f "$VHOST" ] || { echo "No se encontró $VHOST"; exit 1; }

if grep -q "location = /landing-societario.html" "$VHOST"; then
  echo "Las redirecciones ya estaban aplicadas. No hay nada que hacer."
  exit 0
fi

# Se insertan junto a las que ya existen, después de landing-accidentes.
ANCLA=$(grep -n "location = /landing-accidentes.html" "$VHOST" | cut -d: -f1 | head -1)
[ -n "$ANCLA" ] || { echo "No se encontró dónde insertar las reglas."; exit 1; }
echo "Insertando después de la línea $ANCLA"

cp "$VHOST" "$BACKUP"
echo "Respaldo: $BACKUP"

awk -v n="$ANCLA" 'NR==n{
  print
  print "    location = /landing-societario.html { return 301 /societario.html; }"
  print "    location = /politica-privacidad.html { return 301 /privacidad.html; }"
  print "    location = /honorarios.html { return 301 /recursos/cuanto-cuesta-un-abogado-penalista.html; }"
  next
}1' "$VHOST" > /tmp/vhost.redirects
mv /tmp/vhost.redirects "$VHOST"

echo "--- validando configuración ---"
if ! nginx -t 2>&1 | grep -q "test is successful"; then
  echo "Configuración inválida. Restaurando el respaldo."
  cp "$BACKUP" "$VHOST"
  nginx -t
  exit 1
fi

systemctl reload nginx
echo ""
echo "Redirecciones activas:"
grep -oE "location = /[a-z-]+\.html \{ return 301 [^;]+;" "$VHOST" | sed 's/location = /  /;s/ { return 301 / -> /;s/;//'
