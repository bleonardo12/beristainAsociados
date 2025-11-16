const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const { sequelize } = require('./models');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/auth');
const presupuestosRoutes = require('./routes/presupuestos');
const causasRoutes = require('./routes/causas');

// Crear app Express
const app = express();

// ====================
// MIDDLEWARE DE SEGURIDAD
// ====================

// Helmet para headers de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting general
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting para autenticación (más restrictivo)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos de login
    message: {
        success: false,
        message: 'Demasiados intentos de login, por favor intenta más tarde'
    },
    skipSuccessfulRequests: true
});

// ====================
// MIDDLEWARE DE PARSEO
// ====================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// ====================
// LOGGING DE REQUESTS
// ====================

app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });

    next();
});

// ====================
// RUTAS
// ====================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/auth', authLimiter, authRoutes);
app.use('/presupuestos', generalLimiter, presupuestosRoutes);
app.use('/causas', generalLimiter, causasRoutes);

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// ====================
// MANEJO DE ERRORES
// ====================

app.use((err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Error de validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Error de constraint único de Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'El valor ya existe',
            errors: err.errors.map(e => ({
                field: e.path,
                message: 'Este valor ya está en uso'
            }))
        });
    }

    // Error de base de datos
    if (err.name === 'SequelizeDatabaseError') {
        return res.status(500).json({
            success: false,
            message: 'Error en la base de datos'
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : err.message
    });
});

// ====================
// TAREAS PROGRAMADAS
// ====================

// Backup automático todos los días a las 2 AM
if (process.env.ENABLE_AUTO_BACKUP === 'true') {
    cron.schedule('0 2 * * *', async () => {
        logger.info('Ejecutando backup automático...');
        try {
            const { ejecutarBackup } = require('./utils/backup');
            await ejecutarBackup();
            logger.info('✅ Backup automático completado');
        } catch (error) {
            logger.error('❌ Error en backup automático:', error);
        }
    });
}

// Limpieza de logs antiguos cada semana
cron.schedule('0 3 * * 0', () => {
    logger.info('Ejecutando limpieza de logs antiguos...');
    // Implementar limpieza de logs si es necesario
});

// ====================
// INICIO DEL SERVIDOR
// ====================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        logger.info('✅ Conexión a la base de datos establecida');

        // Sincronizar modelos (en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: false });
            logger.info('✅ Modelos sincronizados con la base de datos');
        }

        // Iniciar servidor
        app.listen(PORT, HOST, () => {
            logger.info(`🚀 Servidor corriendo en ${HOST}:${PORT}`);
            logger.info(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 Health check: http://${HOST}:${PORT}/health`);
        });
    } catch (error) {
        logger.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
    logger.info('SIGTERM recibido. Cerrando servidor...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT recibido. Cerrando servidor...');
    await sequelize.close();
    process.exit(0);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
