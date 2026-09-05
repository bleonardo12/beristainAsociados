#!/bin/bash
# Vigila que el dominio siga apuntando a este VPS.
#
# Por qué: el sitio se cayó tres veces en un mes por DNS, y la última vez
# estuvo una semana caído sin que nadie lo notara — el servidor estaba
# perfecto, así que ningún monitor del VPS lo vio. Este script pregunta a un
# resolver público, como haría cualquier visitante, y deja constancia si la
# respuesta no es la IP de este servidor.
#
# Se instala en cron cada 10 minutos:
#   */10 * * * * /bin/bash /var/www/beristainAsociados/deploy/vigilar-dns.sh
#
# Registro:  /var/log/beristain-dns.log   (una línea por desvío; "OK" una vez al día)
IP_VPS=69.62.95.98
LOG=/var/log/beristain-dns.log
ESTADO=/var/tmp/beristain-dns.estado
RESOLVER=1.1.1.1

fallas=""
for h in www.beristainyasociados.com.ar beristainyasociados.com.ar; do
  # dig +short devuelve la cadena CNAME→A; nos quedamos con las IPv4 finales.
  ips=$(dig +short +time=5 +tries=2 A "$h" @"$RESOLVER" 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | sort -u | tr '\n' ' ')
  cname=$(dig +short +time=5 +tries=2 CNAME "$h" @"$RESOLVER" 2>/dev/null | head -1)
  if [ -z "$ips" ]; then
    fallas="$fallas | $h: SIN RESPUESTA A${cname:+ (CNAME→$cname)}"
  elif [ "$ips" != "$IP_VPS " ]; then
    fallas="$fallas | $h: resuelve a ${ips}${cname:+(CNAME→$cname)} en vez de $IP_VPS"
  fi
done

ahora=$(date '+%F %T')
if [ -n "$fallas" ]; then
  echo "$ahora  DESVIO${fallas}" >> "$LOG"
  echo "MAL" > "$ESTADO"
else
  # Si venía de un desvío, dejar constancia de la recuperación.
  [ "$(cat "$ESTADO" 2>/dev/null)" = "MAL" ] && echo "$ahora  RECUPERADO: ambos nombres resuelven a $IP_VPS" >> "$LOG"
  echo "OK" > "$ESTADO"
  # Y una marca diaria de vida, para saber que el vigilante corre.
  [ "$(date +%H%M)" \< "0010" ] && echo "$ahora  OK" >> "$LOG"
fi
