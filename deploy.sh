#!/bin/bash

# Script de deploy automático para Beristain & Asociados
# Uso: ./deploy.sh

echo "🚀 Iniciando deploy..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
TARGET_BRANCH="claude/fix-responsive-design-011CUsQjjT8cgmQ7VTTFRv91"

if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: Estás en la rama '$CURRENT_BRANCH'${NC}"
    echo -e "${YELLOW}   La rama de deploy es '$TARGET_BRANCH'${NC}"
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deploy cancelado"
        exit 1
    fi
fi

# Push a GitHub
echo "📤 Pusheando cambios a GitHub..."
git push -u origin "$CURRENT_BRANCH"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al pushear a GitHub${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Push a GitHub exitoso${NC}"

# Deploy a VPS
echo "📡 Conectando al VPS y actualizando..."

ssh -o StrictHostKeyChecking=no root@69.62.95.98 << 'ENDSSH'
cd /var/www/beristainAsociados

echo "🔄 Fetching cambios..."
git fetch origin

echo "📥 Pulling desde la rama de desarrollo..."
git pull origin claude/fix-responsive-design-011CUsQjjT8cgmQ7VTTFRv91

echo "🔄 Recargando nginx..."
systemctl reload nginx

echo "✅ Deploy completado en VPS"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el deploy al VPS${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ ¡Deploy completado exitosamente!${NC}"
echo ""
echo "🌐 Sitio web: https://www.beristainyasociados.com.ar"
echo ""
