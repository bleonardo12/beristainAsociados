#!/bin/bash
# Script de Despliegue Rápido
# Para usar: ./deploy-rapido.sh "mensaje del commit"

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   🚀 DESPLIEGUE RÁPIDO              ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Verificar que estamos en el repo
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ ERROR: No estás en el repositorio${NC}"
    echo "Navega a: cd /d/EXTRA/hostinger"
    exit 1
fi

# Verificar si hay cambios
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  No hay cambios para deployar${NC}"
    echo ""
    read -p "¿Ver el estado de todos modos? (s/n): " ver_estado
    if [ "$ver_estado" = "s" ] || [ "$ver_estado" = "S" ]; then
        git status
    fi
    exit 0
fi

# Mostrar cambios
echo -e "${BLUE}📋 Archivos modificados:${NC}"
git status --short
echo ""

# Obtener mensaje del commit
if [ -z "$1" ]; then
    echo -e "${YELLOW}💬 Escribe un mensaje para el commit:${NC}"
    read -p "Mensaje: " MENSAJE
else
    MENSAJE="$1"
fi

if [ -z "$MENSAJE" ]; then
    echo -e "${RED}❌ El mensaje no puede estar vacío${NC}"
    exit 1
fi

# Agregar archivos
echo ""
echo -e "${BLUE}📦 Agregando archivos...${NC}"
git add .
echo -e "${GREEN}✓ Archivos agregados${NC}"

# Hacer commit
echo ""
echo -e "${BLUE}💾 Creando commit...${NC}"
git commit -m "$MENSAJE"
echo -e "${GREEN}✓ Commit creado: $MENSAJE${NC}"

# Desplegar
echo ""
echo -e "${BLUE}🚀 Desplegando a GitHub + VPS...${NC}"
git deploy

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ ¡DESPLIEGUE COMPLETADO!      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📍 Próximos pasos:${NC}"
echo "   1. Abre: https://beristainyasociados.com.ar"
echo "   2. Presiona: Ctrl + Shift + R"
echo "   3. ¡Verifica tus cambios!"
echo ""
echo -e "${BLUE}🔍 Para ver el log en VPS:${NC}"
echo "   ssh root@69.62.95.98"
echo "   tail -30 /tmp/git_deploy_log.txt"
echo "   exit"
echo ""
