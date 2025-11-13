#!/usr/bin/env node

/**
 * Script de migración de base de datos
 * Crea las tablas necesarias en la base de datos
 */

require('dotenv').config();
const { sequelize, syncDatabase } = require('../models');
const logger = require('./logger');

const migrate = async () => {
    try {
        console.log('🔄 Iniciando migración de base de datos...\n');

        // Verificar conexión
        console.log('1️⃣ Verificando conexión a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida\n');

        // Obtener configuración
        const config = sequelize.config;
        console.log('📋 Configuración:');
        console.log(`   - Base de datos: ${config.database}`);
        console.log(`   - Host: ${config.host}`);
        console.log(`   - Dialecto: ${config.dialect}`);
        console.log(`   - Usuario: ${config.username}\n`);

        // Preguntar si desea forzar la sincronización
        const args = process.argv.slice(2);
        const force = args.includes('--force');
        const alter = args.includes('--alter');

        if (force) {
            console.log('⚠️  MODO FORCE: Se eliminarán y recrearán todas las tablas');
            console.log('⚠️  TODOS LOS DATOS SE PERDERÁN\n');
        } else if (alter) {
            console.log('🔧 MODO ALTER: Se modificarán las tablas existentes\n');
        } else {
            console.log('✨ MODO SEGURO: Solo se crearán tablas que no existan\n');
        }

        // Sincronizar modelos
        console.log('2️⃣ Sincronizando modelos...');

        if (force) {
            await sequelize.sync({ force: true });
            console.log('✅ Tablas recreadas (todos los datos eliminados)');
        } else if (alter) {
            await sequelize.sync({ alter: true });
            console.log('✅ Tablas modificadas');
        } else {
            await sequelize.sync();
            console.log('✅ Tablas creadas (sin afectar datos existentes)');
        }

        // Listar tablas creadas
        console.log('\n3️⃣ Tablas en la base de datos:');
        const queryInterface = sequelize.getQueryInterface();
        const tables = await queryInterface.showAllTables();

        tables.forEach(table => {
            console.log(`   ✓ ${table}`);
        });

        console.log('\n✅ Migración completada exitosamente!\n');

        // Mostrar siguiente paso
        console.log('📝 Siguiente paso:');
        console.log('   npm run seed    (Para crear el usuario administrador inicial)\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error en la migración:', error);
        logger.error('Error en migración:', error);
        process.exit(1);
    }
};

// Ejecutar migración
migrate();
