#!/bin/bash
# Script para desplegar manualmente los cambios al VPS

echo "======================================"
echo "DESPLEGANDO CAMBIOS AL VPS"
echo "======================================"
echo ""

# Verificar que estemos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
echo "Rama actual: $CURRENT_BRANCH"
echo ""

# Conectar al VPS y hacer pull
echo "Conectando al VPS srv777726.hstgr.cloud..."
echo ""

ssh -i deploy_key root@srv777726.hstgr.cloud << 'EOF'
    echo "Conectado al VPS exitosamente"
    echo ""

    # Ir al directorio del proyecto
    cd /var/www/beristainAsociados

    echo "Directorio actual:"
    pwd
    echo ""

    # Verificar estado actual
    echo "Estado actual del repositorio:"
    git status
    echo ""

    # Hacer backup del estado actual
    echo "Creando backup..."
    git stash
    echo ""

    # Actualizar desde master
    echo "Descargando cambios desde master..."
    git fetch origin master
    echo ""

    echo "Aplicando cambios..."
    git reset --hard origin/master
    echo ""

    # Verificar el resultado
    echo "Verificando archivos actualizados..."
    git log -1 --oneline
    echo ""

    echo "¡Despliegue completado!"
    echo ""

    # Verificar que los archivos nuevos existan
    echo "Verificando archivos clave:"
    [ -f "frontend/js/modules/smoothScroll.js" ] && echo "✓ smoothScroll.js" || echo "✗ smoothScroll.js no encontrado"
    [ -f "frontend/politica-privacidad.html" ] && echo "✓ politica-privacidad.html" || echo "✗ politica-privacidad.html no encontrado"
    [ -f "INSTRUCCIONES_GOOGLE_ADS.md" ] && echo "✓ INSTRUCCIONES_GOOGLE_ADS.md" || echo "✗ INSTRUCCIONES_GOOGLE_ADS.md no encontrado"

    # Verificar que el botón de WhatsApp esté en index.html
    if grep -q "whatsapp-float" frontend/index.html; then
        echo "✓ Botón de WhatsApp detectado en index.html"
    else
        echo "✗ Botón de WhatsApp NO detectado en index.html"
    fi

    echo ""
    echo "======================================"
    echo "Despliegue finalizado"
    echo "======================================"
EOF

echo ""
echo "Para verificar los cambios, visita:"
echo "https://www.beristainyasociados.com.ar"
echo ""
echo "Si no ves los cambios inmediatamente:"
echo "1. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)"
echo "2. Prueba en modo incógnito"
echo "3. Espera unos minutos para que el CDN se actualice"
