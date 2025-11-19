const winston = require('winston');
const path = require('path');

// Definir niveles de log
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

winston.addColors(colors);

// Formato personalizado
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Formato para consola (más legible)
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => {
        if (typeof info.message === 'object') {
            return `${info.timestamp} [${info.level}]: ${JSON.stringify(info.message, null, 2)}`;
        }
        return `${info.timestamp} [${info.level}]: ${info.message}`;
    })
);

// Determinar nivel según ambiente
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};

// Transportes (donde se guardan los logs)
const transports = [
    // Consola
    new winston.transports.Console({
        format: consoleFormat
    }),

    // Archivo de errores
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format,
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }),

    // Archivo de todos los logs
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format,
        maxsize: 5242880, // 5MB
        maxFiles: 5
    })
];

// Crear logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exitOnError: false
});

// Si no estamos en producción, también log a consola con formato bonito
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

module.exports = logger;
