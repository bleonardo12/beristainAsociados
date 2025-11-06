# Hook de Despliegue Git

## Problema Original

El hook `post-receive` original estaba fallando con el error:
```
fatal: ambiguous argument 'refs/heads/master': unknown revision or path not in the working tree.
```

Esto ocurría porque el hook tenía codificado de forma fija (hardcoded) la búsqueda de la rama `master`, pero el repositorio bare en el servidor no tenía esa rama (probablemente usa `main` u otra rama).

## Solución

El hook mejorado ahora:

1. **Detecta automáticamente la rama correcta** en este orden de prioridad:
   - `main` (convención moderna de Git)
   - `master` (convención anterior/heredada)
   - La rama apuntada por `HEAD` simbólico
   - La primera rama disponible en el repositorio

2. **Maneja correctamente las ejecuciones manuales** cuando no llega `newrev` por entrada estándar (stdin)

3. **Proporciona registro detallado** de qué rama está usando para el despliegue

## Instalación en el Servidor

Para instalar este hook en el servidor:

```bash
# Copiar el hook al repositorio bare
scp hooks/post-receive usuario@srv777726:/home/usuario/beristainAsociados/hooks/

# Asegurarse de que sea ejecutable
ssh usuario@srv777726 "chmod +x /home/usuario/beristainAsociados/hooks/post-receive"
```

## Prueba Manual

Para probar el hook manualmente en el servidor:

```bash
# Conectarse al servidor
ssh usuario@srv777726

# Listar ramas disponibles en el repositorio bare
git --git-dir=/home/usuario/beristainAsociados for-each-ref --format='%(refname:short)' refs/heads/

# Ejecutar el hook manualmente (detectará automáticamente la rama)
echo "" | /home/usuario/beristainAsociados/hooks/post-receive

# Ver el registro del despliegue
tail -50 /tmp/git_deploy_log.txt

# Verificar que el index.html se actualizó
stat /var/www/beristainAsociados/frontend/index.html

# Verificar encabezados HTTP
curl -I https://beristainyasociados.com.ar/index.html
```

## Funcionamiento

Cuando se hace push al repositorio:

1. El hook recibe `oldrev`, `newrev` y `ref` por entrada estándar (stdin)
2. Si `newrev` es válido, lo usa directamente
3. Si no, busca la rama por defecto según la prioridad mencionada
4. Exporta el contenido de la carpeta `frontend/` (o la raíz si no existe)
5. Actualiza la marca de tiempo de `index.html` para que Nginx actualice el `Last-Modified`
6. Establece los permisos correctos para `www-data`
7. Guarda el hash del commit y la marca de tiempo del despliegue

## Registro (Log)

El hook guarda toda su salida en `/tmp/git_deploy_log.txt` para depuración.
