require('dotenv').config();
const nodemailer = require('nodemailer');

// Verifica que las variables de entorno estén disponibles
console.log('Verificando variables de entorno:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS definido:', process.env.EMAIL_PASS ? 'Sí' : 'No');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

// Configuración simple del transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Opciones del correo de prueba
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
  subject: 'Prueba de correo ' + new Date().toISOString(),
  text: 'Este es un correo de prueba enviado desde Node.js para verificar la configuración.'
};

// Intenta enviar el correo
console.log('Intentando enviar correo...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error al enviar correo:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    return;
  }
  
  console.log('¡Correo enviado exitosamente!');
  console.log('ID del mensaje:', info.messageId);
  console.log('Respuesta:', info.response);
});
