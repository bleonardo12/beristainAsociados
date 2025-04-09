require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Configura la API key
sgMail.setApiKey("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");

// Mensaje de prueba simple
const msg = {
  to: 'beristainyasociadosej@gmail.com',
  from: 'beristainyasociadosej@gmail.com',
  subject: 'Prueba SendGrid ' + new Date().toISOString(),
  text: 'Este es un mensaje de prueba directa con SendGrid.'
};

console.log('Enviando correo de prueba a:', msg.to);

// Enviar y manejar resultados
sgMail.send(msg)
  .then(response => {
    console.log('Correo enviado correctamente');
    console.log('Respuesta:', JSON.stringify(response, null, 2));
  })
  .catch(error => {
    console.error('Error al enviar:');
    console.error(error.toString());
    if (error.response) {
      console.error('Detalles:', JSON.stringify(error.response.body, null, 2));
    }
  });
