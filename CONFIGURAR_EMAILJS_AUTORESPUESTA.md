# 📧 Configuración de Respuesta Automática en EmailJS

## 🎯 Objetivo
Enviar dos emails cuando un cliente llena el formulario:
1. **Email a ti** (beristainyasociadosej@gmail.com) con los datos del cliente
2. **Email automático al cliente** confirmando que recibiste su mensaje

---

## 📋 PASO 1: Crear Template de Respuesta Automática

### 1. Accede a EmailJS Dashboard
👉 https://dashboard.emailjs.com/admin/templates

### 2. Click en "Create New Template"

### 3. Configura el Template:

**Template Name:** `autorespuesta_cliente`

**Template ID:** (se genera automáticamente, ejemplo: `template_xyz123`)

**From Name:** `Beristain & Asociados`

**From Email:** `beristainyasociadosej@gmail.com`

**To Email:** `{{email}}` ← **IMPORTANTE: esto toma el email del formulario**

**Subject:** `✅ Recibimos tu consulta - Beristain & Asociados`

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-left: 5px solid #f0ca45; }
        .footer { background: #1a365d; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
        .highlight { color: #f0ca45; font-weight: bold; }
        .button { display: inline-block; background: #f0ca45; color: #1a365d; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .datos { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Gracias por contactarnos!</h1>
        </div>

        <div class="content">
            <p>Hola <strong>{{nombre}}</strong>,</p>

            <p>Recibimos tu consulta sobre <span class="highlight">{{asunto}}</span> y queremos agradecerte por confiar en nosotros.</p>

            <div class="datos">
                <h3 style="color: #1a365d;">📋 Resumen de tu consulta:</h3>
                <p><strong>Nombre:</strong> {{nombre}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Área legal:</strong> {{asunto}}</p>
                <p><strong>Mensaje:</strong><br>{{mensaje}}</p>
            </div>

            <p><strong>Nuestro equipo revisará tu caso y te responderá en las próximas 24 horas hábiles.</strong></p>

            <p>Si tu consulta es urgente, podés contactarnos directamente:</p>
            <ul>
                <li>📞 <strong>Teléfono:</strong> (+54) 11 3591-3161</li>
                <li>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/5491135913161" class="button">Chatear ahora</a></li>
            </ul>

            <p><strong>Servicios Penales de Urgencia 24hs:</strong><br>
            Estamos disponibles las 24 horas para emergencias penales.</p>
        </div>

        <div class="footer">
            <p><strong>Beristain & Asociados - Estudio Jurídico</strong></p>
            <p>CABA, Buenos Aires, Argentina</p>
            <p>📧 beristainyasociadosej@gmail.com | 📞 (+54) 11 3591-3161</p>
            <p style="margin-top: 15px;">
                <a href="https://www.instagram.com/beristainyasociados" style="color: #f0ca45; text-decoration: none; margin: 0 10px;">Instagram</a> |
                <a href="https://www.linkedin.com/company/beristainasociados" style="color: #f0ca45; text-decoration: none; margin: 0 10px;">LinkedIn</a> |
                <a href="https://www.tiktok.com/@beristainasociados" style="color: #f0ca45; text-decoration: none; margin: 0 10px;">TikTok</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### 4. **MUY IMPORTANTE:** Click en "Save"

### 5. Copia el **Template ID** (lo necesitarás en el siguiente paso)

---

## 📋 PASO 2: Actualizar el Código JavaScript

El código ya está preparado, solo necesitas agregar el segundo envío después del primero.

**Ubicación:** `frontend/js/modules/contactForm.js`

**Busca la línea 218** (donde dice "Email enviado exitosamente") y agrega después:

```javascript
try {
  const result = await sendWithEmailJS(templateParams);
  console.log('✅ Email enviado exitosamente:', result);
  console.log('📧 Respuesta completa:', JSON.stringify(result, null, 2));

  // ✅ NUEVO: Enviar respuesta automática al cliente
  try {
    console.log('📧 Enviando respuesta automática al cliente...');
    const autoResponse = await emailjs.send(
      window.emailJSConfig.serviceID,
      'template_XXXXXXXX', // ← REEMPLAZAR con el Template ID de autorespuesta
      {
        nombre: templateParams.nombre,
        email: templateParams.email,
        asunto: templateParams.asunto,
        mensaje: templateParams.mensaje
      }
    );
    console.log('✅ Respuesta automática enviada:', autoResponse);
  } catch (autoError) {
    console.warn('⚠️ No se pudo enviar respuesta automática (no afecta el envío principal):', autoError);
  }

  showFeedback("¡Mensaje enviado correctamente! Te contactaremos pronto.");
  form.reset();
} catch (error) {
  // ... resto del código
```

---

## 📋 PASO 3: Configurar Service ID en EmailJS

### 1. Ve a Email Services
👉 https://dashboard.emailjs.com/admin/integration

### 2. Verifica que tu Gmail esté conectado
- Servicio: Gmail
- Service ID: `service_fvgq98a` (ya está configurado)
- **IMPORTANTE:** Asegúrate de que el email configurado sea `beristainyasociadosej@gmail.com`

### 3. Límites de envío
- **Cuenta gratuita:** 200 emails/mes
- **Cuenta pagada:** Ilimitados

---

## 🧪 PASO 4: Probar

1. Ve a tu sitio web
2. Llena el formulario con **TU email personal** en el campo email
3. Envía el formulario
4. Deberías recibir **DOS emails:**
   - ✅ Email 1: En `beristainyasociadosej@gmail.com` (datos del cliente)
   - ✅ Email 2: En tu email personal (respuesta automática)

---

## ✅ CHECKLIST FINAL

- [ ] Template de autorespuesta creado en EmailJS
- [ ] Template ID copiado
- [ ] Código JavaScript actualizado con el Template ID
- [ ] Deploy ejecutado: `./deploy.sh`
- [ ] Prueba realizada con email personal
- [ ] Ambos emails recibidos correctamente

---

## 🆘 TROUBLESHOOTING

### No llega la respuesta automática
1. Verifica que el Template ID sea correcto
2. Revisa la consola del navegador (F12) por errores
3. Verifica que `{{email}}` en el campo "To Email" del template esté correcto
4. Revisa la carpeta de SPAM

### Error de límite de emails
- Si llegas a 200 emails/mes, necesitarás actualizar a plan pagado
- Alternativa: Usar solo email a ti (sin autorespuesta)

### Email llega al cliente pero no a ti
- Verifica que el template original (`template_8jxmper`) tenga tu email correcto

---

## 💰 COSTOS

**EmailJS:**
- **Gratis:** 200 emails/mes (100 consultas = 200 emails)
- **Personal:** $9 USD/mes = ~3,600 ARS/mes (emails ilimitados)
- **Profesional:** $15 USD/mes = ~6,000 ARS/mes (dominios custom)

**Recomendación:** Comenzar con plan gratuito y actualizar si superas 100 consultas/mes.
