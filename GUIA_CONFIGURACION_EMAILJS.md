# 📧 Guía Completa - Configuración de EmailJS

## ¿Qué es EmailJS?
EmailJS permite enviar emails directamente desde tu formulario sin necesidad de un servidor backend. Los emails se envían desde tu cuenta de Gmail usando su infraestructura.

---

## 🚀 Paso a Paso - Configuración Completa

### **Paso 1: Crear Cuenta en EmailJS**

1. Ve a: **https://www.emailjs.com/**
2. Click en **"Sign Up Free"**
3. Regístrate con tu email o Google
4. Verifica tu email (revisa spam/correo no deseado)
5. Inicia sesión en tu dashboard

---

### **Paso 2: Conectar Gmail**

1. En el dashboard, ir al menú **"Email Services"** (lado izquierdo)
2. Click en **"Add New Service"**
3. Seleccionar **"Gmail"**
4. Click en **"Connect Account"**
5. Se abrirá ventana de Google → **Iniciar sesión con**: `beristainyasociadosej@gmail.com`
6. **Autorizar** EmailJS para enviar emails en tu nombre
7. Una vez conectado, verás tu **Service ID** (ejemplo: `service_abc1234`)
8. **⚠️ COPIA Y GUARDA ESTE SERVICE ID**

---

### **Paso 3: Crear Template de Email**

1. Ir al menú **"Email Templates"** (lado izquierdo)
2. Click en **"Create New Template"**
3. Llenar los siguientes campos:

#### **Template Name:**
```
contacto_beristain
```

#### **Subject (Asunto del email):**
```
Nuevo mensaje de contacto - {{asunto}}
```

#### **Content (Cuerpo del email):**
```html
<h2>Nuevo Mensaje de Contacto</h2>

<p><strong>Nombre:</strong> {{nombre}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Área Legal:</strong> {{asunto}}</p>

<h3>Mensaje:</h3>
<p>{{mensaje}}</p>

---
<p><small>Este mensaje fue enviado desde el formulario de contacto de beristainasociados.com</small></p>
```

#### **To Email (Destinatario):**
```
beristainyasociadosej@gmail.com
```

#### **From Name (Nombre del remitente):**
```
{{nombre}}
```

#### **Reply To (Responder a):**
```
{{email}}
```

4. Click en **"Save"**
5. Verás tu **Template ID** (ejemplo: `template_xyz5678`)
6. **⚠️ COPIA Y GUARDA ESTE TEMPLATE ID**

---

### **Paso 4: Probar el Template**

1. En la página del template, click en **"Test It"** (botón azul arriba a la derecha)
2. Llenar los campos de prueba:
   - **nombre**: "Juan Pérez"
   - **email**: "juan@example.com"
   - **asunto**: "Derecho Penal"
   - **mensaje**: "Este es un mensaje de prueba"
3. Click en **"Send Test Email"**
4. **Revisar tu email** `beristainyasociadosej@gmail.com`
5. Deberías recibir el email de prueba
   - Si no llega, revisa **spam/correo no deseado**
   - Si está en spam, **marca como "no es spam"**

---

### **Paso 5: Obtener Public Key**

1. Click en el **ícono de usuario** (arriba a la derecha)
2. Seleccionar **"Account"**
3. En la sección **"General"**
4. Encontrarás tu **Public Key** (ejemplo: `abc123XYZ`)
5. **⚠️ COPIA Y GUARDA ESTA PUBLIC KEY**

---

### **Paso 6: Configurar el Código**

Ahora que tienes tus 3 credenciales, abre el archivo:
```
frontend/js/modules/contactForm.js
```

En las líneas **6-8**, reemplaza los valores por tus credenciales:

```javascript
window.emailJSConfig = {
  serviceID: "service_abc1234",      // ⬅️ REEMPLAZAR con tu Service ID
  templateID: "template_xyz5678",    // ⬅️ REEMPLAZAR con tu Template ID
  publicKey: "abc123XYZ"             // ⬅️ REEMPLAZAR con tu Public Key
};
```

**Ejemplo real:**
```javascript
window.emailJSConfig = {
  serviceID: "service_jk7f9p2",
  templateID: "template_contact_ba",
  publicKey: "xY9zAbC123"
};
```

---

### **Paso 7: Subir Cambios al VPS**

Una vez configuradas las credenciales, ejecuta en tu VPS:

```bash
git fetch origin
git merge origin/claude/code-analysis-review-011CUrs9d18u4h4SN8J6j3Hm
git push origin master
```

---

### **Paso 8: Probar en Producción**

1. Abre tu sitio web
2. Ve al formulario de contacto
3. Llena todos los campos:
   - Nombre: "Prueba Formulario"
   - Email: tu email
   - Área Legal: cualquier opción
   - Mensaje: "Este es un mensaje de prueba"
4. Click en **"Enviar"**
5. Deberías ver:
   - Spinner animado mientras se envía
   - Mensaje de éxito: "¡Mensaje enviado correctamente! Te contactaremos pronto."
6. Revisa tu email `beristainyasociadosej@gmail.com`
7. Deberías recibir el mensaje con todos los datos

---

## ✅ Checklist de Verificación

- [ ] Cuenta de EmailJS creada y verificada
- [ ] Gmail conectado en EmailJS
- [ ] Service ID copiado y guardado
- [ ] Template de email creado
- [ ] Template ID copiado y guardado
- [ ] Template probado y email recibido
- [ ] Public Key copiada y guardada
- [ ] Credenciales configuradas en `contactForm.js`
- [ ] Cambios subidos al VPS
- [ ] Formulario probado en producción
- [ ] Email de prueba recibido en Gmail

---

## 🚨 Solución de Problemas

### **No recibo los emails**
1. Revisa la carpeta de **spam/correo no deseado**
2. Verifica que el email en "To Email" sea correcto: `beristainyasociadosej@gmail.com`
3. En EmailJS, ir a "Dashboard" → "History" para ver si los emails se enviaron
4. Si hay errores, revisa el mensaje de error

### **Error: "Configuración pendiente"**
- Significa que no reemplazaste las credenciales en `contactForm.js`
- Verifica que los valores no sean "TU_SERVICE_ID", "TU_TEMPLATE_ID", etc.

### **Error: "EmailJS no está cargado"**
- Verifica que el script de EmailJS esté en el HTML:
  ```html
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  ```

### **El spinner no aparece**
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Verifica que el spinner esté en el HTML

### **Límite de emails alcanzado**
- Plan gratuito: 200 emails/mes
- Si necesitas más, actualiza a plan pagado en EmailJS
- O implementa backend propio con Node.js

---

## 📊 Plan Gratuito de EmailJS

- **200 emails por mes**
- **50 MB de almacenamiento**
- **2 servicios de email**
- **50 templates**

Para la mayoría de estudios jurídicos, el plan gratuito es más que suficiente.

---

## 🔒 Seguridad

- ✅ Las credenciales (Service ID, Template ID, Public Key) son seguras para exponer en el frontend
- ✅ EmailJS tiene rate limiting automático para prevenir spam
- ✅ Solo tu dominio puede enviar emails (configurable en EmailJS)
- ✅ Todos los emails se registran en EmailJS → "History"

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la documentación de EmailJS: https://www.emailjs.com/docs/
2. Revisa el historial de envíos en EmailJS → "Dashboard" → "History"
3. Abre la consola del navegador (F12) y busca errores

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu formulario de contacto estará funcionando y recibirás todos los mensajes directamente en tu Gmail.

Los visitantes verán un spinner profesional mientras se envía el mensaje y recibirán confirmación de que su mensaje fue enviado correctamente.
