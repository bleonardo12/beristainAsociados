#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const util = require('util');

// Convertir funciones de callback a promesas
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

// Configuración
const args = process.argv.slice(2);
let command = '';
let sourcePath = '';
let targetPath = '';
let shouldExecute = false;

// Parsing de argumentos
if (args.length > 0) {
  command = args[0];
  
  if (command === 'dedup' && args.length > 1) {
    sourcePath = args[1];
    shouldExecute = args.includes('--execute');
  } else if (command === 'sync' && args.length > 2) {
    sourcePath = args[1];
    targetPath = args[2];
    shouldExecute = args.includes('--execute');
  } else {
    showHelp();
    process.exit(1);
  }
} else {
  showHelp();
  process.exit(1);
}

// Función para mostrar ayuda
function showHelp() {
  console.log(`
  Uso:
    node script.js dedup [directorio] [--execute]
    node script.js sync [origen] [destino] [--execute]
  
  Comandos:
    dedup     Encuentra y elimina archivos duplicados
    sync      Sincroniza dos directorios

  Opciones:
    --execute     Ejecuta los cambios (sin esta opción, solo muestra lo que haría)
  `);
}

// Función para calcular el hash MD5 de un archivo
async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

// Función para encontrar todos los archivos en un directorio recursivamente
async function findAllFiles(dir) {
  const result = [];
  
  async function walk(currentPath) {
    const files = await readdir(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        await walk(filePath);
      } else {
        result.push(filePath);
      }
    }
  }
  
  await walk(dir);
  return result;
}

// Función para encontrar y eliminar duplicados
async function removeDuplicates(directory, execute) {
  console.log(`Analizando archivos en ${directory}...`);
  
  try {
    // Paso 1: Encontrar todos los archivos
    const allFiles = await findAllFiles(directory);
    console.log(`Encontrados ${allFiles.length} archivos para analizar.`);
    
    if (allFiles.length === 0) {
      console.log('No se encontraron archivos para analizar.');
      return;
    }
    
    // Paso 2: Agrupar archivos por tamaño
    const sizeMap = new Map();
    const errors = [];
    let filesDone = 0;
    
    console.log('Agrupando archivos por tamaño...');
    
    for (const filePath of allFiles) {
      try {
        const fileStat = await stat(filePath);
        const size = fileStat.size;
        
        if (!sizeMap.has(size)) {
          sizeMap.set(size, []);
        }
        
        sizeMap.get(size).push(filePath);
      } catch (error) {
        errors.push({ file: filePath, error: error.message });
      }
      
      filesDone++;
      if (filesDone % 100 === 0 || filesDone === allFiles.length) {
        const percent = Math.floor((filesDone / allFiles.length) * 100);
        process.stdout.write(`\r[${filesDone}/${allFiles.length}] ${percent}% completado`);
      }
    }
    
    console.log('\nAgrupación por tamaño completada.');
    
    // Paso 3: Filtrar grupos con más de un archivo (potenciales duplicados)
    const potentialDuplicates = new Map();
    let totalPotentialDupes = 0;
    
    for (const [size, files] of sizeMap.entries()) {
      if (files.length > 1) {
        potentialDuplicates.set(size, files);
        totalPotentialDupes += files.length;
      }
    }
    
    if (potentialDuplicates.size === 0) {
      console.log('No se encontraron archivos con el mismo tamaño.');
      return;
    }
    
    console.log(`\nEncontrados ${totalPotentialDupes} archivos con tamaños duplicados.`);
    
    // Paso 4: Calcular hashes para identificar duplicados exactos
    let duplicatesFound = 0;
    let bytesSaved = 0;
    let filesProcessed = 0;
    
    console.log('\nCalculando hashes para identificar duplicados exactos...');
    
    for (const [size, files] of potentialDuplicates.entries()) {
      const hashMap = new Map();
      
      for (const filePath of files) {
        try {
          const fileHash = await calculateFileHash(filePath);
          
          if (hashMap.has(fileHash)) {
            // Es un duplicado
            const originalFile = hashMap.get(fileHash);
            
            if (execute) {
              try {
                await unlink(filePath);
                console.log(`\nEliminado: ${filePath}`);
                console.log(`  (duplicado de ${originalFile})`);
                duplicatesFound++;
                bytesSaved += size;
              } catch (error) {
                console.log(`\nError al eliminar ${filePath}: ${error.message}`);
              }
            } else {
              console.log(`\nSe eliminaría: ${filePath}`);
              console.log(`  (duplicado de ${originalFile})`);
              duplicatesFound++;
              bytesSaved += size;
            }
          } else {
            hashMap.set(fileHash, filePath);
          }
        } catch (error) {
          errors.push({ file: filePath, error: error.message });
        }
        
        filesProcessed++;
        const percent = Math.floor((filesProcessed / totalPotentialDupes) * 100);
        process.stdout.write(`\r[${filesProcessed}/${totalPotentialDupes}] ${percent}% completado`);
      }
    }
    
    console.log('\n');
    
    // Resumen
    if (errors.length > 0) {
      console.log(`\nHubo ${errors.length} errores al procesar archivos:`);
      for (let i = 0; i < Math.min(errors.length, 10); i++) {
        console.log(`  ${errors[i].file}: ${errors[i].error}`);
      }
      if (errors.length > 10) {
        console.log(`  ... y ${errors.length - 10} más`);
      }
    }
    
    console.log(`\nResumen:`);
    console.log(`  Archivos analizados: ${allFiles.length}`);
    console.log(`  Duplicados encontrados: ${duplicatesFound}`);
    
    if (duplicatesFound > 0) {
      const mbSaved = bytesSaved / (1024 * 1024);
      const gbSaved = mbSaved / 1024;
      
      if (gbSaved >= 1) {
        console.log(`  Espacio que se liberaría: ${gbSaved.toFixed(2)} GB`);
      } else {
        console.log(`  Espacio que se liberaría: ${mbSaved.toFixed(2)} MB`);
      }
      
      if (!execute) {
        console.log(`\nEjecuta con --execute para eliminar los duplicados`);
      }
    }
    
  } catch (error) {
    console.error(`Error general: ${error.message}`);
  }
}

// Función para sincronizar directorios
async function syncDirectories(source, target, execute) {
  console.log(`Sincronizando de ${source} a ${target}...`);
  
  try {
    // Verificar si el directorio origen existe
    try {
      await stat(source);
    } catch (error) {
      console.error(`El directorio origen no existe: ${source}`);
      return;
    }
    
    // Crear el directorio destino si no existe
    try {
      await stat(target);
    } catch (error) {
      if (execute) {
        console.log(`Creando directorio destino: ${target}`);
        await mkdir(target, { recursive: true });
      } else {
        console.log(`Se crearía el directorio destino: ${target}`);
      }
    }
    
    // Encontrar todos los archivos en el origen
    const sourceFiles = await findAllFiles(source);
    console.log(`Encontrados ${sourceFiles.length} archivos en el origen.`);
    
    // Encontrar todos los archivos en el destino
    const targetFiles = await findAllFiles(target);
    console.log(`Encontrados ${targetFiles.length} archivos en el destino.`);
    
    // Mapear archivos de destino para búsqueda rápida
    const targetFilesMap = new Map();
    for (const file of targetFiles) {
      const relativePath = path.relative(target, file);
      targetFilesMap.set(relativePath, file);
    }
    
    // Mapear archivos de origen para búsqueda rápida
    const sourceFilesMap = new Map();
    for (const file of sourceFiles) {
      const relativePath = path.relative(source, file);
      sourceFilesMap.set(relativePath, file);
    }
    
    // Procesar archivos: copiar nuevos o actualizados
    let filesToCopy = 0;
    let filesToUpdate = 0;
    let filesToDelete = 0;
    
    for (const sourceFile of sourceFiles) {
      const relativePath = path.relative(source, sourceFile);
      const targetFile = path.join(target, relativePath);
      
      if (!targetFilesMap.has(relativePath)) {
        // Archivo nuevo
        filesToCopy++;
        if (execute) {
          try {
            // Asegurar que el directorio exista
            const targetDir = path.dirname(targetFile);
            await mkdir(targetDir, { recursive: true });
            
            await copyFile(sourceFile, targetFile);
            console.log(`Copiado: ${relativePath}`);
          } catch (error) {
            console.error(`Error al copiar ${relativePath}: ${error.message}`);
          }
        } else {
          console.log(`Se copiaría: ${relativePath}`);
        }
      } else {
        // El archivo existe, verificar si necesita actualización
        try {
          const sourceStats = await stat(sourceFile);
          const targetStats = await stat(targetFile);
          
          if (sourceStats.size !== targetStats.size || 
              sourceStats.mtime.getTime() > targetStats.mtime.getTime()) {
            // Archivo modificado
            filesToUpdate++;
            if (execute) {
              await copyFile(sourceFile, targetFile);
              console.log(`Actualizado: ${relativePath}`);
            } else {
              console.log(`Se actualizaría: ${relativePath}`);
            }
          }
        } catch (error) {
          console.error(`Error al comparar ${relativePath}: ${error.message}`);
        }
      }
    }
    
    // Eliminar archivos que no existen en el origen
    for (const [relativePath, targetFile] of targetFilesMap.entries()) {
      if (!sourceFilesMap.has(relativePath)) {
        filesToDelete++;
        if (execute) {
          try {
            await unlink(targetFile);
            console.log(`Eliminado: ${relativePath} (no existe en origen)`);
          } catch (error) {
            console.error(`Error al eliminar ${relativePath}: ${error.message}`);
          }
        } else {
          console.log(`Se eliminaría: ${relativePath} (no existe en origen)`);
        }
      }
    }
    
    // Resumen
    console.log(`\nResumen de sincronización:`);
    console.log(`  Archivos nuevos: ${filesToCopy}`);
    console.log(`  Archivos a actualizar: ${filesToUpdate}`);
    console.log(`  Archivos a eliminar: ${filesToDelete}`);
    
    if (!execute && (filesToCopy > 0 || filesToUpdate > 0 || filesToDelete > 0)) {
      console.log(`\nEjecuta con --execute para realizar los cambios`);
    }
    
  } catch (error) {
    console.error(`Error general: ${error.message}`);
  }
}

// Ejecutar el comando apropiado
if (command === 'dedup') {
  removeDuplicates(sourcePath, shouldExecute);
} else if (command === 'sync') {
  syncDirectories(sourcePath, targetPath, shouldExecute);
}