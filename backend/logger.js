// En logger.js, agregamos una condición especial para entorno de pruebas
const pino = require('pino');

const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isTest = environment === 'test';

// En tests, usamos un nivel más alto para reducir el ruido
// y enviamos los logs a pino.destination({ sync: false })
const options = {
  level: isTest ? 'warn' : (isProduction ? 'info' : 'debug'),
  
  // En test, deshabilitamos completamente los logs o los enviamos a /dev/null
  ...(isTest ? { 
    transport: {
      target: 'pino/file',
      options: { destination: '/dev/null' }
    }
  } : {}),
  
  // En desarrollo, usamos pino-pretty para logs legibles
  ...((!isProduction && !isTest) ? {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    }
  } : {}),
  
  base: undefined,
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

const logger = pino(options);

// Solo logueamos la inicialización si no estamos en test
if (!isTest) {
  logger.info({ environment }, 'Logger inicializado');
}

module.exports = logger;