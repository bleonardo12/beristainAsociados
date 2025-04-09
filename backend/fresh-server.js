// server.js - Servidor Express para manejar el formulario de contacto
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const pino = require('pino');
const pinoHttp = require('pino-http');
const logger = require('./logger');

// SendGrid para envío de correos
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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'); // Reemplaza con tu API key

// Inicializar app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar el middleware de logging
const httpLogger = pinoHttp({
    logger: logger,
    genReqId: (req) => req.id || require('crypto').randomUUID(),
    customProps: (req, res) => {
      return {
        route: req.originalUrl,
        method: req.method
      };
    },
    autoLogging: {
      ignore: (req) => req.url === '/api/status' || req.url === '/health'
    },
    serializers: {
      req: (req) => {
        const serialized = pino.stdSerializers.req(req);
        if (process.env.NODE_ENV !== 'production' && req.raw.body) {
          serialized.body = req.raw.body;
        }
        return serialized;
      }
    }
});

// Aplicar el middleware a Express
app.use(httpLogger);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS
app.use(cors({
  origin: [
    'https://www.beristainyasociados.com.ar',
    'https://beristainyasociados.com.ar'
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limitar las solicitudes
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 solicitudes por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes enviadas. Por favor, intente nuevamente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validación del formulario
const validateContactForm = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  
  body('telefono')
    .optional({ checkFalsy: true })
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Número de teléfono no válido'),
  
  body('asunto')
    .trim()
    .notEmpty().withMessage('El área legal es requerida'),
  
  body('mensaje')
    .trim()
    .notEmpty().withMessage('El mensaje es requerido')
    .isLength({ min: 10, max: 3000 }).withMessage('El mensaje debe tener entre 10 y 3000 caracteres')
];

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
  res.status(200).send('El servidor está funcionando correctamente.');
});

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta para procesar el formulario de contacto
app.post('/api/contacto', 
  contactFormLimiter, 
  validateContactForm, 
  async (req, res) => {
    // Añadir estos logs detallados
    console.log('Solicitud de formulario recibida:');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body:', JSON.stringify(req.body));
  
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Error en la validación de datos',
          errors: errors.array().map(err => err.msg)
        });
      }

      // Extraer datos del formulario
      const { nombre, email, telefono, asunto, mensaje } = req.body;

      // Configurar correo con SendGrid
      const msg = {
        to: process.env.ADMIN_EMAIL || 'beristainyasociadosej@gmail.com',
        from: 'beristainyasociadosej@gmail.com', // Email verificado en SendGrid
        replyTo: email,
        subject: `Nueva consulta: ${asunto} | Beristain & Asociados`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1a365d; border-radius: 5px;">
            <h2 style="color: #1a365d; border-bottom: 2px solid #4a6fa5; padding-bottom: 10px;">Nueva consulta desde la web</h2>
            
            <div style="margin: 20px 0;">
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
              <p><strong>Área legal:</strong> ${asunto}</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4a6fa5; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Mensaje:</h3>
              <p style="white-space: pre-line;">${mensaje}</p>
            </div>
            
            <div style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              <p>Este mensaje fue enviado desde el formulario de contacto de Beristain & Asociados.</p>
              <p>IP: ${req.ip} - Fecha: ${new Date().toLocaleString('es-AR')}</p>
            </div>
          </div>
        `
      };

      // Log antes de enviar
      logger.info('Intentando enviar correo con SendGrid:', {
        to: msg.to,
        subject: msg.subject
      });
      
      // Enviar correo con SendGrid
      await sgMail.send(msg);
      
      // Log después del envío
      logger.info('Correo enviado exitosamente con SendGrid');

      // Responder con éxito
      res.status(200).json({
        success: true,
        message: 'Consulta recibida correctamente. Nos pondremos en contacto pronto.'
      });

    } catch (error) {
      // Registro detallado de errores
      logger.error('Error al enviar correo con SendGrid:', {
        message: error.message,
        code: error.code,
        response: error.response ? error.response.body : null
      });

      // Respuesta genérica de error
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor. Por favor, intente nuevamente más tarde.'
      });
    }
});

// Endpoint para chatbot
app.post('/api/chatbot', async (req, res) => {
  const { mensaje, usuario, conversacion } = req.body;
  
  // Loguear la solicitud
  logger.info({ 
    route: '/api/chatbot', 
    method: 'POST',
    usuario
  }, 'Mensaje de chatbot recibido');
  
  // Validar la solicitud
  if (!mensaje) {
    logger.warn({ body: req.body }, 'Mensaje de chatbot vacío');
    return res.status(400).json({ error: 'El mensaje es requerido' });
  }
  
  try {
    // Configurar correo con SendGrid
    const msg = {
      to: process.env.ADMIN_EMAIL || 'beristainyasociadosej@gmail.com',
      from: 'beristainyasociadosej@gmail.com',
      subject: `Nuevo mensaje de chatbot de ${usuario || 'Usuario anónimo'}`,
      html: `
        <h2>Nuevo mensaje del chatbot</h2>
        <p><strong>Usuario:</strong> ${usuario || 'Anónimo'}</p>
        <p><strong>ID de conversación:</strong> ${conversacion || 'N/A'}</p>
        <p><strong>Mensaje:</strong></p>
        <div style="background-color: #f4f4f4; padding: 10px; border-left: 3px solid #007bff;">
          ${mensaje}
        </div>
        <p><em>Este mensaje fue enviado desde el chatbot de tu sitio web.</em></p>
      `
    };
    
    // Log antes de enviar
    logger.info('Intentando enviar mensaje de chatbot con SendGrid:', {
      to: msg.to,
      subject: msg.subject
    });
    
    // Enviar correo con SendGrid
    await sgMail.send(msg);
    
    logger.info('Mensaje de chatbot enviado correctamente con SendGrid');
    return res.status(200).json({ mensaje: 'Mensaje recibido y enviado correctamente' });
  } catch (error) {
    logger.error({ err: error }, 'Error al procesar mensaje de chatbot con SendGrid');
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware de manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Servidor para formulario de contacto iniciado en puerto ${PORT}`);
    logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Error no capturado:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    server.close(() => {
      process.exit(1);
    });
});

// Manejar rechazos de promesas no manejados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rechazo de promesa no manejado:', reason);
});

module.exports = server;
