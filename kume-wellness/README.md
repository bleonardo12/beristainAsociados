# 🌿 Küme - Espacio Wellness

Sitio web profesional para centro de belleza y bienestar con sistema de reservas online y envío automático de emails de confirmación.

## 📋 Características

✅ Diseño moderno y responsivo (móvil, tablet, desktop)
✅ Sistema de reservas de turnos online
✅ Envío automático de emails de confirmación
✅ Formulario con validación en tiempo real
✅ Restricción de fechas (no permite domingos ni fechas pasadas)
✅ Integración con WhatsApp
✅ Links a redes sociales (Instagram, Facebook)
✅ Optimizado para SEO

## 🎨 Servicios Incluidos

- Masajes (relajantes, descontracturantes, piedras calientes, reflexología)
- Fototerapia (luz LED para rejuvenecimiento)
- Hilos de Colágeno (lifting facial no quirúrgico)
- Dermapen (microagujas para regeneración)

## 🚀 Instalación y Configuración

### Paso 1: Archivos del Proyecto

El sitio está completo con estos archivos:

```
kume-wellness/
├── index.html           # Página principal
├── css/
│   └── styles.css       # Estilos personalizados
├── js/
│   └── main.js          # JavaScript principal
├── img/                 # Carpeta para imágenes (agregar logo y fotos)
└── README.md            # Este archivo
```

### Paso 2: Configurar EmailJS (IMPORTANTE)

El sistema de reservas envía emails automáticos usando EmailJS. Sigue estos pasos:

#### 2.1. Crear Cuenta en EmailJS

1. Ve a https://www.emailjs.com/
2. Click en **"Sign Up"** (Registrarse)
3. Crea una cuenta gratuita con tu email
4. Verifica tu email

#### 2.2. Conectar tu Gmail

1. En el dashboard de EmailJS, ve a **"Email Services"**
2. Click en **"Add New Service"**
3. Selecciona **"Gmail"**
4. Click en **"Connect Account"** y autoriza con tu Gmail
5. Guarda el **Service ID** que aparece (ejemplo: `service_abc123`)

#### 2.3. Crear Template de Email

1. Ve a **"Email Templates"**
2. Click en **"Create New Template"**
3. Copia y pega este contenido:

**Subject (Asunto):**
```
Confirmación de Reserva - Küme Wellness 🌿
```

**Content (Contenido):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f6f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8B9A7B 0%, #6B7A5B 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 36px; margin: 0; letter-spacing: 3px;">KÜME</h1>
            <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0;">Espacio Wellness</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #6B7A5B; font-size: 24px; margin-bottom: 20px;">¡Reserva Confirmada!</h2>

            <p style="color: #5C5955; font-size: 16px; line-height: 1.6;">
                Hola <strong>{{cliente_nombre}}</strong>,
            </p>

            <p style="color: #5C5955; font-size: 16px; line-height: 1.6;">
                Tu reserva ha sido confirmada exitosamente. Estamos felices de recibirte en Küme Wellness.
            </p>

            <!-- Detalles de la reserva -->
            <div style="background-color: #f8f6f4; border-left: 4px solid #8B9A7B; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="color: #6B7A5B; font-size: 18px; margin-top: 0;">Detalles de tu Reserva:</h3>

                <p style="color: #5C5955; font-size: 15px; margin: 10px 0;">
                    <strong>Servicio:</strong> {{servicio}}
                </p>

                <p style="color: #5C5955; font-size: 15px; margin: 10px 0;">
                    <strong>Fecha:</strong> {{fecha}}
                </p>

                <p style="color: #5C5955; font-size: 15px; margin: 10px 0;">
                    <strong>Horario:</strong> {{horario}} hs
                </p>

                <p style="color: #5C5955; font-size: 15px; margin: 10px 0;">
                    <strong>Teléfono:</strong> {{cliente_telefono}}
                </p>

                {{#comentarios}}
                <p style="color: #5C5955; font-size: 15px; margin: 10px 0;">
                    <strong>Comentarios:</strong> {{comentarios}}
                </p>
                {{/comentarios}}
            </div>

            <!-- Recomendaciones -->
            <div style="background-color: #E8DFD3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #6B7A5B; font-size: 16px; margin-top: 0;">Recordatorios Importantes:</h3>
                <ul style="color: #5C5955; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                    <li>Por favor, llega 10 minutos antes de tu turno</li>
                    <li>Si necesitas cancelar o reprogramar, contactanos con 24hs de anticipación</li>
                    <li>Trae ropa cómoda para tu tratamiento</li>
                    <li>No olvides tu DNI</li>
                </ul>
            </div>

            <!-- CTA WhatsApp -->
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #5C5955; font-size: 15px; margin-bottom: 15px;">
                    ¿Tenés alguna consulta?
                </p>
                <a href="https://wa.me/5491112345678" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    📱 Contactanos por WhatsApp
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f6f4; padding: 30px 20px; text-align: center; border-top: 1px solid #e8e4df;">
            <p style="color: #8A867F; font-size: 14px; margin: 5px 0;">
                <strong>Küme - Espacio Wellness</strong>
            </p>
            <p style="color: #8A867F; font-size: 13px; margin: 5px 0;">
                📍 Buenos Aires, Argentina
            </p>
            <p style="color: #8A867F; font-size: 13px; margin: 5px 0;">
                📞 WhatsApp: +54 9 11 1234-5678
            </p>
            <p style="color: #8A867F; font-size: 13px; margin: 15px 0 5px 0;">
                Seguinos en Instagram:
                <a href="https://www.instagram.com/kume.wellness" style="color: #8B9A7B; text-decoration: none;">@kume.wellness</a>
            </p>
        </div>
    </div>
</body>
</html>
```

4. Guarda el template y anota el **Template ID** (ejemplo: `template_xyz456`)

#### 2.4. Obtener Public Key

1. Ve a **"Account"** → **"General"**
2. Copia tu **Public Key** (ejemplo: `abc123xyz456`)

#### 2.5. Configurar en el Código

Abre el archivo `js/main.js` y reemplaza estos valores en las líneas 6-10:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'TU_SERVICE_ID',      // Pegar tu Service ID aquí
    templateID: 'TU_TEMPLATE_ID',    // Pegar tu Template ID aquí
    publicKey: 'TU_PUBLIC_KEY'       // Pegar tu Public Key aquí
};
```

Y en la línea 93, reemplaza con tu email:

```javascript
admin_email: 'tucorreo@gmail.com'  // Tu email para recibir las reservas
```

### Paso 3: Personalizar Contacto y Redes Sociales

#### 3.1. Número de WhatsApp

Busca y reemplaza `+5491112345678` con tu número real en:
- `index.html` (líneas 273, 488, y botón flotante)
- `js/main.js` (si es necesario)

**Formato correcto:** `+54 9 11 1234-5678` (código país + 9 + código área + número)

#### 3.2. Instagram

El link a Instagram ya está configurado como `@kume.wellness`. Si usas otro username:
- Busca `kume.wellness` en `index.html`
- Reemplaza con tu username de Instagram

### Paso 4: Agregar Imágenes y Logo

1. Crea o consigue un logo para Küme Wellness
2. Guárdalo en la carpeta `img/` como `logo.png` o `logo.svg`
3. Reemplaza el texto "KÜME" en el navbar con tu logo:

```html
<!-- En index.html, línea ~48 -->
<a class="navbar-brand" href="index.html" title="Küme - Espacio Wellness">
    <img src="img/logo.png" alt="Küme Wellness" height="50">
</a>
```

4. Agrega fotos del spa en `img/` y reemplaza el placeholder en la sección "Sobre Nosotros"

### Paso 5: Configurar Google Analytics (Opcional)

1. Crea una cuenta en https://analytics.google.com/
2. Obtén tu ID de medición (ejemplo: `G-XXXXXXXXXX`)
3. Descomenta y configura el código en `index.html` (líneas 44-46):

```html
<script async defer src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🌐 Despliegue del Sitio

### Opción 1: GitHub Pages (GRATIS)

1. Sube todos los archivos a un repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama main y carpeta /kume-wellness
4. Tu sitio estará en: `https://tu-usuario.github.io/nombre-repo/`

### Opción 2: Netlify (GRATIS)

1. Ve a https://www.netlify.com/
2. Arrastra la carpeta `kume-wellness` al área de drop
3. Tu sitio estará online en segundos con URL gratuita
4. Puedes conectar un dominio personalizado después

### Opción 3: Vercel (GRATIS)

1. Ve a https://vercel.com/
2. Importa tu proyecto desde GitHub
3. Vercel desplegará automáticamente
4. Dominio gratuito incluido

## 📱 Testing

### Probar el Sistema de Reservas

1. Abre `index.html` en tu navegador
2. Ve a la sección "Reservar Turno"
3. Completa el formulario con datos de prueba
4. Verifica que:
   - ✅ No permite fechas pasadas
   - ✅ No permite seleccionar domingos
   - ✅ Valida todos los campos correctamente
   - ✅ Envía el email de confirmación
   - ✅ Muestra mensaje de éxito

### Probar en Diferentes Dispositivos

- 📱 Móvil (320px - 480px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (1280px+)

## 🎨 Personalización de Colores

Los colores están definidos en `css/styles.css` (líneas 3-20):

```css
:root {
    --primary: #8B9A7B;        /* Verde salvia */
    --secondary: #D4C5B0;       /* Beige */
    --accent: #C19A7B;          /* Terracota */
    /* ... más colores */
}
```

Puedes cambiarlos a tu gusto. Herramientas útiles:
- https://coolors.co/ (generador de paletas)
- https://colorhunt.co/ (paletas prediseñadas)

## 📧 Configuración Avanzada de EmailJS

### Enviar Email También al Administrador

Si querés recibir una copia de cada reserva en tu email:

1. En EmailJS, crea un segundo template llamado "Notificación Admin"
2. Configúralo para que se envíe a tu email
3. En `js/main.js`, después de enviar el primer email, agrega:

```javascript
// Enviar notificación al admin
await emailjs.send(
    EMAILJS_CONFIG.serviceID,
    'template_admin_notification',  // Tu segundo template
    templateParams
);
```

### Límites del Plan Gratuito de EmailJS

- ✅ 200 emails/mes gratis
- ✅ Suficiente para ~6 reservas por día
- 💰 Si necesitas más, el plan pago es $15/mes (2000 emails)

## ⚙️ Mantenimiento

### Actualizar Horarios

Edita el array de horarios en `index.html` (líneas 356-369):

```html
<option value="09:00">09:00</option>
<option value="10:00">10:00</option>
<!-- Agrega o quita horarios según tu disponibilidad -->
```

### Agregar Nuevos Servicios

1. Agrega la opción en el select de servicios (línea 343)
2. Agrega una nueva tarjeta de servicio en la sección Servicios
3. Actualiza la función `getServiceName()` en `js/main.js`

## 🆘 Soporte y Problemas Comunes

### El email no se envía

- Verifica que las credenciales de EmailJS estén correctas
- Revisa la consola del navegador (F12) para ver errores
- Asegúrate de tener conexión a internet
- Verifica que el template de EmailJS esté correctamente configurado

### El formulario no valida

- Verifica que todos los campos tengan el atributo `required`
- Revisa que los IDs de los inputs coincidan con el JavaScript
- Abre la consola (F12) y busca errores

### El sitio no se ve bien en móvil

- Asegúrate de que el meta viewport esté en el `<head>`
- Verifica que las imágenes no sean demasiado grandes
- Prueba con diferentes navegadores

## 📝 Próximos Pasos Sugeridos

- [ ] Agregar logo profesional
- [ ] Tomar fotos del local y tratamientos
- [ ] Configurar dominio personalizado (ejemplo: kumewellness.com.ar)
- [ ] Agregar sistema de cancelación de turnos
- [ ] Integrar calendario de disponibilidad en tiempo real
- [ ] Agregar testimonios de clientes
- [ ] Configurar certificado SSL (HTTPS) si usas hosting propio

## 📞 Contacto y Ayuda

Si necesitas ayuda para configurar el sitio:
- 📧 Email: tu@email.com
- 📱 WhatsApp: +54 9 11 1234-5678

---

✨ **¡Éxitos con Küme Wellness!** ✨

Hecho con 💚 para tu negocio de bienestar.
