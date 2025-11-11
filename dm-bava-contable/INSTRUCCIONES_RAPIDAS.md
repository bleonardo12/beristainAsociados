# ⚡ INSTRUCCIONES RÁPIDAS - 5 MINUTOS

Guía ultra-rápida para configurar y publicar tu sitio web de DM Bava Estudio Contable.

---

## ✅ PASO 1: VERIFICAR ARCHIVOS (30 segundos)

Asegúrate de tener todos estos archivos:

```
✓ index.html
✓ css/styles.css
✓ js/main.js
✓ README.md
✓ INSTRUCCIONES_RAPIDAS.md
```

---

## 📧 PASO 2: CONFIGURAR EMAILJS (2 minutos)

### 2.1 Crear cuenta

1. Ve a: **https://www.emailjs.com/**
2. Clic en **"Sign Up"** (registrarse)
3. Verifica tu email

### 2.2 Configurar Gmail

1. En EmailJS → **"Email Services"** → **"Add New Service"**
2. Selecciona **"Gmail"**
3. Conecta tu cuenta Gmail (danielambava@gmail.com)
4. **COPIA el Service ID** (ejemplo: `service_abc123`)

### 2.3 Crear plantilla

1. Ve a **"Email Templates"** → **"Create New Template"**
2. **Template Name:** `DM Bava Contact`
3. **Subject:** `Nueva consulta - DM Bava`
4. **Body:**

```
Nombre: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}
Servicio: {{service}}
Mensaje: {{message}}
```

5. **To Email:** `danielambava@gmail.com`
6. **COPIA el Template ID** (ejemplo: `template_xyz789`)

### 2.4 Obtener Public Key

1. Ve a **"Account"** → **"General"**
2. **COPIA tu Public Key** (ejemplo: `abcd1234efgh5678`)

### 2.5 Pegar credenciales

Abre `js/main.js` y reemplaza:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_abc123',     // ← Pega tu Service ID aquí
    templateID: 'template_xyz789',   // ← Pega tu Template ID aquí
    publicKey: 'abcd1234efgh5678'    // ← Pega tu Public Key aquí
};
```

**¡Listo!** El formulario ya funciona.

---

## 🚀 PASO 3: SUBIR A GITHUB (1 minuto)

```bash
# Crear repositorio en GitHub llamado: dm-bava-contable

# En tu terminal:
cd dm-bava-contable
git init
git add .
git commit -m "Initial commit: DM Bava Estudio Contable"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/dm-bava-contable.git
git push -u origin main
```

---

## 🌐 PASO 4: PUBLICAR EN NETLIFY (1.5 minutos)

### Opción A: Interfaz Web (más fácil)

1. Ve a: **https://app.netlify.com/**
2. Clic en **"Add new site"** → **"Import an existing project"**
3. Conecta tu GitHub
4. Selecciona el repo **dm-bava-contable**
5. Configuración:
   - **Branch:** `main`
   - **Build command:** (dejar vacío)
   - **Publish directory:** `/`
6. Clic en **"Deploy site"**

### Opción B: CLI (más rápido)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**¡Tu sitio ya está ONLINE!** 🎉

---

## 🔧 PASO 5: VERIFICAR QUE TODO FUNCIONE (30 segundos)

Prueba en tu sitio en vivo:

1. ✅ Abrir el sitio en móvil, tablet y desktop
2. ✅ Hacer clic en el botón de WhatsApp (debe abrir WhatsApp)
3. ✅ Llenar y enviar el formulario de contacto
4. ✅ Verificar que llegue el email a `danielambava@gmail.com`
5. ✅ Navegar por todas las secciones

---

## 📝 PASO 6 (OPCIONAL): PERSONALIZAR

### Agregar foto profesional

1. Guarda tu foto en: `img/daniela-bava.jpg`
2. En `index.html`, busca "Sobre Mí" y reemplaza:

```html
<img src="img/daniela-bava.jpg" alt="Daniela Bava" class="img-fluid" style="border-radius: 20px;">
```

3. Guarda y vuelve a hacer push:

```bash
git add .
git commit -m "Agregar foto profesional"
git push
```

Netlify actualizará automáticamente.

---

## 🎨 CAMBIAR COLORES (OPCIONAL)

En `css/styles.css`, edita:

```css
:root {
    --primary: #D4919F;       /* Rosado principal */
    --accent: #8B5A7A;        /* Color de acento */
}
```

---

## 📱 DATOS DE CONTACTO

El sitio ya tiene configurado:

- 📧 **Email:** danielambava@gmail.com
- 📞 **WhatsApp:** +54 9 11 2827-6362

Si necesitas cambiarlos, busca en `index.html` y reemplaza.

---

## ✅ CHECKLIST FINAL

Antes de compartir tu sitio, verifica:

- [x] EmailJS funciona (probaste el formulario)
- [x] WhatsApp abre correctamente
- [x] Email y teléfono correctos
- [x] Sitio responsive (probaste en móvil)
- [x] Todos los links funcionan
- [x] Textos sin errores

---

## 🆘 ¿PROBLEMAS?

### Formulario no funciona

1. Verifica que pegaste bien las 3 credenciales de EmailJS en `js/main.js`
2. Revisa la consola del navegador (F12) para ver errores
3. Asegúrate de que el email en EmailJS sea `danielambava@gmail.com`

### WhatsApp no abre

- Verifica que el número sea: `5491128276362` (con prefijo internacional)

### Cambios no se ven en Netlify

```bash
# Fuerza actualización:
git add .
git commit -m "Actualización"
git push

# Netlify detectará los cambios en ~30 segundos
```

---

## 🎯 RESUMEN DE 5 MINUTOS

1. ⏱️ **30 seg** - Verificar archivos
2. ⏱️ **2 min** - Configurar EmailJS
3. ⏱️ **1 min** - Subir a GitHub
4. ⏱️ **1.5 min** - Publicar en Netlify
5. ⏱️ **30 seg** - Probar el sitio

**TOTAL: ~5 minutos** ✅

---

## 📖 MÁS INFORMACIÓN

Para detalles completos, consulta: **README.md**

---

**¡Felicitaciones! Tu sitio profesional ya está online.** 🚀

Comparte tu enlace de Netlify (ejemplo: `https://dm-bava-contable.netlify.app`) y empieza a recibir consultas.

---

**Desarrollado con profesionalismo para DM Bava Estudio Contable**

© 2025 DM Bava. Todos los derechos reservados.
