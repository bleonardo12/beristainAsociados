const request = require('supertest');
const server = require('../beristain-contact-backend/server');

afterAll(async () => {
  await server.close();
});

describe('Servidor de Contacto', () => {
  // Test de endpoint de estado
  describe('GET /api/status', () => {
    it('debería responder con estado online', async () => {
      const response = await request(server).get('/api/status');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  // Test de validación de formulario de contacto
  describe('POST /api/contacto', () => {
    // Test de envío exitoso
    it('debería aceptar un formulario válido', async () => {
      const validForm = {
        nombre: "Juan Perez",
        email: "juan.perez@ejemplo.com",
        telefono: "+541234567890",
        asunto: "Derecho Penal",
        mensaje: "Necesito asesoramiento legal sobre un caso penal."
      };

      const response = await request(server)
        .post('/api/contacto')
        .send(validForm);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    // Test de validación de nombre
    it('debería rechazar nombre inválido', async () => {
      const invalidForm = {
        nombre: "Juan123",
        email: "juan.perez@ejemplo.com",
        telefono: "+541234567890",
        asunto: "Derecho Penal",
        mensaje: "Necesito asesoramiento legal sobre un caso penal."
      };

      const response = await request(server)
        .post('/api/contacto')
        .send(invalidForm);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.errors).toContain('El nombre solo puede contener letras');
    });

    // Test de email inválido
    it('debería rechazar email inválido', async () => {
      const invalidForm = {
        nombre: "Juan Perez",
        email: "email-invalido",
        telefono: "+541234567890",
        asunto: "Derecho Penal",
        mensaje: "Necesito asesoramiento legal sobre un caso penal."
      };

      const response = await request(server)
        .post('/api/contacto')
        .send(invalidForm);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.errors).toContain('El email no es válido');
    });
  });

  // Test de ruta no encontrada
  describe('Rutas no existentes', () => {
    it('debería responder 404 para rutas inexistentes', async () => {
      const response = await request(server).get('/ruta-inexistente');
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Ruta no encontrada');
    });
  });
});