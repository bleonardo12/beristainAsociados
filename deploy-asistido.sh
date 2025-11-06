#!/bin/bash
# Script de Despliegue Asistido
# Te guía paso a paso para desplegar tus cambios

set -e

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin Color

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║       🚀 ASISTENTE DE DESPLIEGUE PASO A PASO         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el proyecto correcto
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ ERROR: No estás en un repositorio Git${NC}"
    echo "Navega a tu proyecto primero:"
    echo "  cd /home/user/beristainAsociados"
    exit 1
fi

echo -e "${BLUE}📂 Directorio actual:${NC}"
pwd
echo ""

# PASO 1: Ver cambios
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📋 PASO 1: Verificando archivos modificados...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✓ No hay cambios pendientes${NC}"
    echo "Todos tus archivos están al día."
    echo ""
    read -p "¿Quieres continuar de todos modos? (s/n): " continuar
    if [ "$continuar" != "s" ] && [ "$continuar" != "S" ]; then
        echo "Saliendo..."
        exit 0
    fi
else
    echo -e "${YELLOW}Archivos modificados:${NC}"
    git status --short
    echo ""

    echo -e "${BLUE}¿Qué cambios hiciste?${NC}"
    git diff --stat
    echo ""
fi

read -p "Presiona ENTER para continuar..."
echo ""

# PASO 2: Agregar archivos
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📦 PASO 2: Agregando archivos al commit...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "¿Qué archivos quieres agregar?"
echo "  1) Todos los archivos modificados (git add .)"
echo "  2) Solo archivos específicos"
echo ""
read -p "Selecciona (1 o 2): " opcion_add

if [ "$opcion_add" = "1" ]; then
    git add .
    echo -e "${GREEN}✓ Todos los archivos agregados${NC}"
elif [ "$opcion_add" = "2" ]; then
    echo "Archivos disponibles:"
    git status --short
    echo ""
    read -p "Escribe el nombre del archivo (ej: frontend/index.html): " archivo
    git add "$archivo"
    echo -e "${GREEN}✓ Archivo agregado: $archivo${NC}"
else
    echo -e "${RED}Opción inválida${NC}"
    exit 1
fi
echo ""

# Mostrar qué se va a commitear
echo -e "${BLUE}Archivos preparados para commit:${NC}"
git status --short
echo ""

read -p "Presiona ENTER para continuar..."
echo ""

# PASO 3: Commit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}💾 PASO 3: Creando commit...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Escribe un mensaje descriptivo para este commit:"
echo "Ejemplos:"
echo "  - Actualizar contenido de la página principal"
echo "  - Corregir error en el formulario de contacto"
echo "  - Agregar nueva sección de testimonios"
echo ""
read -p "Mensaje: " mensaje_commit

if [ -z "$mensaje_commit" ]; then
    echo -e "${RED}❌ El mensaje no puede estar vacío${NC}"
    exit 1
fi

git commit -m "$mensaje_commit"
echo ""
echo -e "${GREEN}✓ Commit creado exitosamente${NC}"
echo ""

read -p "Presiona ENTER para continuar..."
echo ""

# PASO 4: Push
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🚀 PASO 4: Subiendo cambios al servidor...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detectar rama actual
RAMA_ACTUAL=$(git branch --show-current)
echo -e "${BLUE}Rama actual: $RAMA_ACTUAL${NC}"
echo ""

read -p "¿Subir cambios a GitHub? (s/n): " confirmar_push
if [ "$confirmar_push" != "s" ] && [ "$confirmar_push" != "S" ]; then
    echo "Push cancelado. Puedes hacerlo manualmente después con:"
    echo "  git push origin $RAMA_ACTUAL"
    exit 0
fi

echo ""
echo "Subiendo cambios..."
git push origin "$RAMA_ACTUAL"
echo ""
echo -e "${GREEN}✓ Cambios subidos exitosamente a GitHub${NC}"
echo ""

read -p "Presiona ENTER para continuar..."
echo ""

# PASO 5: Instrucciones para VPS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🔐 PASO 5: Verificar despliegue en el VPS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}Para verificar que el despliegue funcionó:${NC}"
echo ""
echo "1. Conectarse al VPS:"
echo -e "   ${GREEN}ssh usuario@srv777726${NC}"
echo ""
echo "2. Ver el log del despliegue:"
echo -e "   ${GREEN}tail -30 /tmp/git_deploy_log.txt${NC}"
echo ""
echo "3. Buscar esta línea:"
echo -e "   ${GREEN}Despliegue completado.${NC}"
echo ""
echo "4. Salir del VPS:"
echo -e "   ${GREEN}exit${NC}"
echo ""

read -p "¿Quieres que te muestre los comandos para copiar/pegar? (s/n): " mostrar_comandos
if [ "$mostrar_comandos" = "s" ] || [ "$mostrar_comandos" = "S" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "COMANDOS PARA EL VPS (copia y pega en otra terminal):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cat << 'VPS_COMMANDS'
ssh usuario@srv777726
tail -30 /tmp/git_deploy_log.txt
exit
VPS_COMMANDS
    echo ""
fi

# PASO 6: Verificar en navegador
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🌐 PASO 6: Verificar en el navegador${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}Para ver tus cambios en el sitio web:${NC}"
echo ""
echo "1. Abre: https://beristainyasociados.com.ar"
echo ""
echo "2. Recarga sin caché:"
echo "   - Windows/Linux: Ctrl + Shift + R"
echo "   - Mac: Cmd + Shift + R"
echo ""
echo "3. O abre en modo incógnito:"
echo "   - Chrome: Ctrl + Shift + N"
echo "   - Firefox: Ctrl + Shift + P"
echo ""

# Resumen final
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                    ✅ ¡COMPLETADO!                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Resumen de lo que hicimos:${NC}"
echo "  ✓ Agregamos archivos modificados"
echo "  ✓ Creamos un commit: '$mensaje_commit'"
echo "  ✓ Subimos los cambios a GitHub (rama: $RAMA_ACTUAL)"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "  1. Conectarte al VPS y verificar el log"
echo "  2. Abrir el sitio web y verificar los cambios"
echo "  3. Si algo falla, revisar /tmp/git_deploy_log.txt en el VPS"
echo ""
echo -e "${BLUE}Último commit:${NC}"
git log -1 --oneline
echo ""
echo "¡Gracias por usar el asistente de despliegue! 🚀"
echo ""
