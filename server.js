// server.js - Servidor Express para manejar el formulario de contacto
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Inicializar app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS para permitir solicitudes desde tu dominio
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.beristainyasociados.com.ar',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuración de transporte de correo con verificación de conexión
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secure: true,
  requireTLS: true
});

// Verificar configuración de correo
transporter.verify((error, success) => {
  if (error) {
    console.error('Error de configuración de correo:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  } else {
    console.log('Servidor de correo configurado correctamente');
  }
});

// Limitar las solicitudes para prevenir spam (máximo 5 por hora)
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

// Ruta de estado del servidor
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

      // Configurar correo al estudio
      const mailOptions = {
        from: `"Formulario Web" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || 'beristainyasociadosej@gmail.com',
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

      // Enviar correo al estudio
      await transporter.sendMail(mailOptions);

      // Responder con éxito
      res.status(200).json({
        success: true,
        message: 'Consulta recibida correctamente. Nos pondremos en contacto pronto.'
      });

    } catch (error) {
      // Registro detallado de errores
      console.error('Error al procesar formulario de contacto:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });

      // Respuesta genérica de error
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor. Por favor, intente nuevamente más tarde.'
      });
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
  console.log(`Servidor para formulario de contacto iniciado en puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', {
    message: error.message,
    name: error.name,
    stack: error.stack
  });
  
  // Cerrar el servidor de forma segura
  server.close(() => {
    process.exit(1);
  });
});

// Manejar rechazos de promesas no manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo de promesa no manejado:', reason);
});

module.exports = app; // Para testing