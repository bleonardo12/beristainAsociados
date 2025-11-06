# Backend del Formulario de Contacto - Pendiente de Implementación

## Estado Actual
El formulario de contacto en el frontend está configurado para enviar datos a `/api/contacto`, pero **el backend no está implementado aún**.

## Endpoint Esperado
- **URL**: `/api/contacto`
- **Método**: POST
- **Content-Type**: application/json

## Estructura de Datos que Envía el Frontend

```json
{
  "nombre": "string",
  "email": "string",
  "asunto": "string",
  "mensaje": "string"
}
```

## Respuesta Esperada

### Éxito (200 OK)
```json
{
  "success": true,
  "message": "Mensaje recibido correctamente"
}
```

### Error (400/500)
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

## Opciones de Implementación

### Opción 1: Node.js + Express
```bash
cd backend
npm init -y
npm install express cors dotenv nodemailer
```

### Opción 2: Python + Flask
```bash
cd backend
pip install flask flask-cors python-dotenv
```

### Opción 3: Servicio Externo
- FormSpree: https://formspree.io/
- EmailJS: https://www.emailjs.com/
- Netlify Forms (si se hospeda en Netlify)
- Vercel Edge Functions (si se hospeda en Vercel)

## Funcionalidad Requerida

1. **Validación de datos**
   - Validar que todos los campos estén presentes
   - Validar formato de email
   - Sanitizar inputs contra XSS

2. **Envío de email**
   - Configurar servicio SMTP (Gmail, SendGrid, etc.)
   - Enviar email a: beristainyasociadosej@gmail.com
   - Incluir todos los datos del formulario

3. **Rate Limiting**
   - Limitar envíos por IP
   - Prevenir spam

4. **Logging**
   - Registrar intentos de envío
   - Registrar errores

## Variables de Entorno Necesarias

```env
# Servidor
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://tu-dominio.com

# Email (ejemplo con Gmail)
EMAIL_USER=beristainyasociadosej@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Rate Limiting
MAX_REQUESTS_PER_HOUR=5
```

## Próximos Pasos

1. Decidir qué opción de implementación usar
2. Configurar el servidor backend
3. Implementar endpoint `/api/contacto`
4. Configurar servicio de email
5. Probar envío de formularios
6. Desplegar backend en VPS o servicio cloud
7. Actualizar frontend con URL del backend en producción
