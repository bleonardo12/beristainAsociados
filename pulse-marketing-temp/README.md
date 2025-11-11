# 🚀 PULSE Marketing - Sitio Web Profesional

**El Pulso de Tu Marca**

Sitio web profesional para agencia de marketing digital. Especializada en Community Management, Diseño Web, Google Ads y Comunicación Empresarial.

---

## 📋 Características

✅ **Diseño Moderno y Responsivo**
✅ **Paleta de Colores Profesional** (Coral + Turquesa)
✅ **Formulario de Contacto con EmailJS**
✅ **Botones de WhatsApp Integrados**
✅ **Secciones de Servicios y Casos de Éxito**
✅ **Optimizado para SEO**
✅ **100% Responsive** (Mobile, Tablet, Desktop)

---

## 🎨 Paleta de Colores

```css
--primary: #FF6B6B        /* Coral vibrante - Energía, creatividad */
--secondary: #4ECDC4      /* Turquesa - Digital, frescura */
--accent: #FFE66D         /* Amarillo suave - Optimismo */
--dark: #2D3142           /* Gris oscuro - Profesionalismo */
--light: #F7F9FB          /* Blanco suave - Limpieza */
```

---

## 📁 Estructura del Proyecto

```
pulse-marketing/
├── index.html              # Página principal
├── css/
│   └── styles.css         # Estilos personalizados
├── js/
│   └── main.js           # JavaScript + EmailJS
├── img/                   # Imágenes (agregar cuando tengas)
├── README.md             # Este archivo
└── INSTRUCCIONES_RAPIDAS.md  # Guía rápida
```

---

## ⚙️ Configuración EmailJS (IMPORTANTE)

### Paso 1: Crear Cuenta en EmailJS

1. Ir a: **https://www.emailjs.com/**
2. Click en **"Sign Up Free"**
3. Verificar email

### Paso 2: Conectar Gmail

1. Dashboard → **"Email Services"** → **"Add New Service"**
2. Seleccionar **"Gmail"**
3. Autorizar la cuenta: **Mktberistainestudio@gmail.com**
4. Guardar el **Service ID** (ej: `service_abc123`)

### Paso 3: Crear Template de Email

1. Dashboard → **"Email Templates"** → **"Create New Template"**

**Configuración del Template:**

**Template Name:**
```
pulse_contacto
```

**Subject:**
```
Nueva Consulta de {{nombre}} - PULSE Marketing
```

**Content (HTML):**
```html
<h2 style="color: #FF6B6B;">🚀 Nueva Consulta - PULSE Marketing</h2>

<div style="background: #f7f9fb; padding: 20px; border-left: 4px solid #4ECDC4; margin: 20px 0;">
    <p><strong>📋 Datos del Cliente:</strong></p>
    <p><strong>Nombre:</strong> {{nombre}}</p>
    <p><strong>Teléfono:</strong> {{telefono}}</p>
    <p><strong>Email:</strong> {{email}}</p>
    <p><strong>Empresa/Marca:</strong> {{empresa}}</p>
    <p><strong>Servicio de Interés:</strong> {{servicio}}</p>
</div>

<h3 style="color: #2D3142;">📝 Mensaje:</h3>
<p>{{mensaje}}</p>

<hr style="border: 1px solid #e2e8f0; margin: 30px 0;">

<p style="font-size: 12px; color: #64748b;">
    <strong>PULSE Marketing - El Pulso de Tu Marca</strong><br>
    Email: Mktberistainestudio@gmail.com<br>
    WhatsApp: +54 9 11 7364-2577 (Sofía) | +54 9 11 4091-8785 (Julieta)<br>
    Este mensaje fue enviado desde el formulario de contacto web.
</p>
```

**To Email:**
```
{{to_email}}
```

**From Name:**
```
{{nombre}}
```

**Reply To:**
```
{{email}}
```

2. Click **"Save"**
3. Guardar el **Template ID** (ej: `template_xyz456`)

### Paso 4: Obtener Public Key

1. Click en tu usuario (arriba derecha) → **"Account"**
2. En la sección **"General"** copiar tu **Public Key** (ej: `abc123XYZ`)

### Paso 5: Configurar el Código

Abrir `js/main.js` y reemplazar las líneas 6-10:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_abc123',      // TU Service ID
    templateID: 'template_xyz456',    // TU Template ID
    publicKey: 'abc123XYZ'            // TU Public Key
};
```

---

## 📞 Contactos WhatsApp

Ya configurados en el sitio:

- **Sofía Beristain:** +54 9 11 7364-2577
- **Julieta Beristain:** +54 9 11 4091-8785

---

## 🚀 Publicar el Sitio

### Opción 1: Netlify (Recomendado - Gratis)

1. Ir a: **https://app.netlify.com/drop**
2. Arrastrar la carpeta `pulse-marketing` completa
3. ¡Listo! Tendrás una URL tipo: `https://pulse-marketing-123.netlify.app`

### Opción 2: Vercel

1. Ir a: **https://vercel.com**
2. Crear cuenta
3. Click **"New Project"**
4. Importar desde GitHub o arrastrar carpeta

### Opción 3: GitHub Pages

1. Subir a repositorio de GitHub
2. Settings → Pages
3. Seleccionar branch `main` y carpeta `/root`
4. Guardar

---

## 🎯 Secciones del Sitio

### 1. Hero Section
- Título principal: "El Pulso de Tu Marca"
- CTA: Agendar Reunión
- Estadísticas visuales

### 2. Servicios
1. **Community Manager** (Sofía Beristain)
   - Gestión de RRSS
   - Creación de contenido
   - Diseño gráfico
   - Métricas y reportes

2. **Diseño Web & SEO**
   - Sitios web profesionales
   - Optimización SEO
   - Responsive design

3. **Google Ads & Publicidad**
   - Campañas efectivas
   - Optimización ROI
   - Análisis de métricas

4. **Comunicación Empresarial** (Julieta Beristain)
   - Relaciones con medios
   - Edición de video
   - Notas periodísticas

### 3. Casos de Éxito
- Beristain & Asociados (Estudio Jurídico)
- Küme Wellness (Estética Holística)
- Club Agronomía Central (Deportivo)
- Bennu Pastelería (Gastronomía)

### 4. Formulario de Contacto
- Campos: Nombre, Teléfono, Email, Empresa, Servicio, Mensaje
- Envío a: Mktberistainestudio@gmail.com
- Botones de WhatsApp directos

---

## 🔧 Personalizaciones Futuras

### Agregar Logo
1. Guardar logo en `img/logo.png`
2. En `index.html` línea ~40, reemplazar texto por:
```html
<a class="navbar-brand" href="#inicio">
    <img src="img/logo.png" alt="PULSE Marketing" height="50">
</a>
```

### Agregar Redes Sociales
En el footer, agregar:
```html
<div class="social-links">
    <a href="https://instagram.com/tu_cuenta" target="_blank">
        <i class="bi bi-instagram"></i>
    </a>
    <a href="https://facebook.com/tu_pagina" target="_blank">
        <i class="bi bi-facebook"></i>
    </a>
</div>
```

### Cambiar Colores
Editar `css/styles.css` líneas 3-8:
```css
:root {
    --primary: #TU_COLOR;
    --secondary: #TU_COLOR;
}
```

### Agregar Fotos de Casos de Éxito
1. Guardar fotos en `img/casos/`
2. En cada `.case-card`, agregar antes del título:
```html
<img src="img/casos/cliente1.jpg" alt="Cliente" class="case-image">
```

---

## 📊 Métricas y Analytics

### Google Analytics (Opcional)
Agregar antes de `</head>` en `index.html`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🆘 Solución de Problemas

### El formulario no envía emails
✅ Verificar que las 3 credenciales de EmailJS estén correctas en `js/main.js`
✅ Abrir consola del navegador (F12) y buscar errores
✅ Verificar que el email `Mktberistainestudio@gmail.com` esté correcto

### El sitio no se ve bien en móvil
✅ Abrir con Chrome o Safari (no Internet Explorer)
✅ El sitio es 100% responsive, probar con diferentes dispositivos

### Los botones de WhatsApp no funcionan
✅ Verificar que los números estén correctos: 1173642577 y 1140918785
✅ Probar abrir en móvil directamente

---

## 📝 Próximos Pasos Sugeridos

1. ✅ Configurar EmailJS (5 min)
2. ✅ Probar formulario localmente
3. ✅ Agregar logo (cuando tengas)
4. ✅ Agregar fotos de casos de éxito (opcional)
5. ✅ Publicar en Netlify
6. ✅ Configurar dominio personalizado (ej: pulsemarketing.com.ar)
7. ✅ Crear redes sociales de la agencia
8. ✅ Agregar Google Analytics

---

## 👥 Equipo

**Sofía Beristain** - Community Manager
WhatsApp: +54 9 11 7364-2577

**Julieta Beristain** - Comunicación Empresarial
WhatsApp: +54 9 11 4091-8785

**Email:** Mktberistainestudio@gmail.com

---

## 📄 Licencia

© 2025 PULSE Marketing. Todos los derechos reservados.

---

## 🎉 ¡Listo para Impulsar Tu Marca!

¿Dudas? Revisa `INSTRUCCIONES_RAPIDAS.md` para un setup express de 5 minutos.
