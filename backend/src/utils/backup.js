#!/usr/bin/env node

/**
 * Utilidad para realizar backups de la base de datos MySQL
 */

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const logger = require('./logger');

const execPromise = util.promisify(exec);

// Directorio de backups
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Crear directorio si no existe
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Genera nombre de archivo de backup
 */
const generarNombreBackup = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `backup_${year}${month}${day}_${hours}${minutes}${seconds}.sql`;
};

/**
 * Ejecuta backup de la base de datos
 */
const ejecutarBackup = async () => {
    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'beristain_db',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        };

        const nombreArchivo = generarNombreBackup();
        const rutaCompleta = path.join(BACKUP_DIR, nombreArchivo);

        console.log('🔄 Iniciando backup de la base de datos...');
        console.log(`📋 Base de datos: ${dbConfig.database}`);
        console.log(`📁 Archivo: ${nombreArchivo}\n`);

        // Construir comando mysqldump
        const comando = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} ${
            dbConfig.password ? `-p${dbConfig.password}` : ''
        } ${dbConfig.database} > "${rutaCompleta}"`;

        // Ejecutar backup
        await execPromise(comando);

        // Verificar que el archivo se creó
        const stats = fs.statSync(rutaCompleta);
        const tamañoMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('✅ Backup completado exitosamente!');
        console.log(`📊 Tamaño: ${tamañoMB} MB`);
        console.log(`📍 Ubicación: ${rutaCompleta}\n`);

        logger.info(`Backup creado: ${nombreArchivo} (${tamañoMB} MB)`);

        // Limpiar backups antiguos
        await limpiarBackupsAntiguos();

        return rutaCompleta;
    } catch (error) {
        console.error('❌ Error al crear backup:', error.message);
        logger.error('Error en backup:', error);
        throw error;
    }
};

/**
 * Limpia backups antiguos (mantiene solo los últimos 7)
 */
const limpiarBackupsAntiguos = async () => {
    try {
        const archivos = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
            .map(f => ({
                nombre: f,
                ruta: path.join(BACKUP_DIR, f),
                tiempo: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
            }))
            .sort((a, b) => b.tiempo - a.tiempo);

        // Mantener solo los últimos 7 backups
        const maxBackups = parseInt(process.env.MAX_BACKUPS) || 7;

        if (archivos.length > maxBackups) {
            console.log(`🧹 Limpiando backups antiguos (manteniendo ${maxBackups})...`);

            const archivosAEliminar = archivos.slice(maxBackups);

            for (const archivo of archivosAEliminar) {
                fs.unlinkSync(archivo.ruta);
                console.log(`   🗑️  Eliminado: ${archivo.nombre}`);
            }

            console.log('');
        }
    } catch (error) {
        logger.error('Error al limpiar backups antiguos:', error);
    }
};

/**
 * Restaura un backup
 */
const restaurarBackup = async (archivoBackup) => {
    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'beristain_db',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        };

        console.log('🔄 Restaurando backup...');
        console.log(`📋 Base de datos: ${dbConfig.database}`);
        console.log(`📁 Archivo: ${archivoBackup}\n`);

        // Verificar que el archivo existe
        if (!fs.existsSync(archivoBackup)) {
            throw new Error('Archivo de backup no encontrado');
        }

        // Construir comando mysql
        const comando = `mysql -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} ${
            dbConfig.password ? `-p${dbConfig.password}` : ''
        } ${dbConfig.database} < "${archivoBackup}"`;

        // Ejecutar restauración
        await execPromise(comando);

        console.log('✅ Backup restaurado exitosamente!\n');
        logger.info(`Backup restaurado: ${archivoBackup}`);

        return true;
    } catch (error) {
        console.error('❌ Error al restaurar backup:', error.message);
        logger.error('Error en restauración:', error);
        throw error;
    }
};

/**
 * Lista todos los backups disponibles
 */
const listarBackups = () => {
    try {
        const archivos = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
            .map(f => {
                const stats = fs.statSync(path.join(BACKUP_DIR, f));
                return {
                    nombre: f,
                    ruta: path.join(BACKUP_DIR, f),
                    tamaño: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                    fecha: stats.mtime
                };
            })
            .sort((a, b) => b.fecha - a.fecha);

        return archivos;
    } catch (error) {
        logger.error('Error al listar backups:', error);
        return [];
    }
};

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const comando = args[0];

    if (comando === 'create') {
        ejecutarBackup()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    } else if (comando === 'list') {
        console.log('📋 Backups disponibles:\n');
        const backups = listarBackups();

        if (backups.length === 0) {
            console.log('   No hay backups disponibles\n');
        } else {
            backups.forEach((backup, index) => {
                console.log(`${index + 1}. ${backup.nombre}`);
                console.log(`   📊 Tamaño: ${backup.tamaño}`);
                console.log(`   📅 Fecha: ${backup.fecha.toLocaleString()}`);
                console.log('');
            });
        }

        process.exit(0);
    } else if (comando === 'restore' && args[1]) {
        restaurarBackup(args[1])
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    } else {
        console.log('Uso:');
        console.log('  npm run backup create        - Crear nuevo backup');
        console.log('  npm run backup list          - Listar backups disponibles');
        console.log('  npm run backup restore FILE  - Restaurar un backup\n');
        process.exit(1);
    }
}

module.exports = {
    ejecutarBackup,
    restaurarBackup,
    listarBackups
};
