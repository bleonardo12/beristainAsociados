#!/usr/bin/env node

/**
 * Script de seed para crear usuario administrador inicial
 */

require('dotenv').config();
const readline = require('readline');
const { User, sequelize } = require('../models');
const logger = require('./logger');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
};

const seed = async () => {
    try {
        console.log('🌱 Seed - Crear usuario administrador inicial\n');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');

        // Verificar si ya existe un admin
        const existingAdmin = await User.findOne({ where: { rol: 'admin' } });

        if (existingAdmin) {
            console.log('⚠️  Ya existe un usuario administrador en la base de datos:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Nombre: ${existingAdmin.nombre}\n`);

            const continuar = await question('¿Deseas crear otro administrador? (s/n): ');

            if (continuar.toLowerCase() !== 's') {
                console.log('\n✅ Operación cancelada');
                rl.close();
                process.exit(0);
            }
        }

        console.log('Ingresa los datos del nuevo administrador:\n');

        // Solicitar datos
        const nombre = await question('Nombre completo: ');
        const email = await question('Email: ');
        const password = await question('Password (mínimo 6 caracteres): ');

        // Validar datos
        if (!nombre || nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        if (!email || !email.includes('@')) {
            throw new Error('Email inválido');
        }

        if (!password || password.length < 6) {
            throw new Error('El password debe tener al menos 6 caracteres');
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // Crear usuario
        console.log('\n🔄 Creando usuario administrador...');

        const admin = await User.create({
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            password,
            rol: 'admin',
            activo: true
        });

        console.log('\n✅ Usuario administrador creado exitosamente!\n');
        console.log('📋 Detalles:');
        console.log(`   ID: ${admin.id}`);
        console.log(`   Nombre: ${admin.nombre}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Rol: ${admin.rol}`);
        console.log(`   Activo: ${admin.activo ? 'Sí' : 'No'}\n`);

        console.log('🚀 Siguiente paso:');
        console.log('   npm start    (Para iniciar el servidor)\n');

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        logger.error('Error en seed:', error);
        rl.close();
        process.exit(1);
    }
};

// Ejecutar seed
seed();
