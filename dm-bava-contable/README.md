# DM Bava Estudio Contable - Sitio Web Profesional

Sitio web profesional para **Daniela Magalí Bava**, Contadora Pública Nacional especializada en servicios contables, impositivos y estratégicos.

## 📋 Descripción

Sitio web moderno y profesional diseñado específicamente para un estudio contable de alto nivel. Incluye:

- ✅ Diseño responsive (móvil, tablet y desktop)
- ✅ Paleta de colores rosado pastel profesional
- ✅ 9 servicios contables detallados
- ✅ Formulario de contacto con EmailJS
- ✅ Integración con WhatsApp (flotante y formularios)
- ✅ Animaciones suaves y profesionales
- ✅ SEO optimizado

---

## 🎨 Paleta de Colores

El diseño utiliza una paleta rosado pastel profesional que transmite calidez, confianza y carácter:

```css
--primary: #D4919F        /* Rosado principal */
--primary-dark: #B47283   /* Rosado oscuro (hover) */
--secondary: #E8B4C8      /* Rosado pastel suave */
--accent: #8B5A7A         /* Morado-rosado (detalles) */
--dark: #3D2E35           /* Texto principal */
--light: #FFF5F9          /* Fondos suaves */
```

---

## 📂 Estructura del Proyecto

```
dm-bava-contable/
│
├── index.html              # Página principal (única página)
├── README.md               # Este archivo
├── INSTRUCCIONES_RAPIDAS.md  # Guía rápida de 5 minutos
│
├── css/
│   └── styles.css          # Estilos personalizados
│
├── js/
│   └── main.js             # JavaScript principal + EmailJS
│
└── img/
    └── (agregar fotos profesionales aquí)
```

---

## ⚙️ Configuración Inicial

### 1. Abrir el proyecto

Simplemente abre `index.html` en tu navegador para ver el sitio localmente.

### 2. Configurar EmailJS (Formulario de Contacto)

El formulario de contacto utiliza **EmailJS** para enviar emails sin necesidad de backend.

#### Paso 1: Crear cuenta en EmailJS

1. Ve a https://www.emailjs.com/
2. Haz clic en **"Sign Up"** (Registrarse)
3. Completa el registro con tu email
4. Verifica tu email

#### Paso 2: Conectar tu cuenta de Gmail

1. En el dashboard de EmailJS, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona **"Gmail"**
4. Haz clic en **"Connect Account"**
5. Inicia sesión con la cuenta Gmail que quieres usar para recibir mensajes
6. Autoriza EmailJS
7. Dale un nombre al servicio (ej: "DM_Bava_Contacto")
8. **COPIA el Service ID** (ejemplo: `service_abc123`)

#### Paso 3: Crear plantilla de email

1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Configura así:

**Template Name:** `DM Bava Contact Form`

**Subject:**
```
Nueva consulta desde DM Bava Estudio Contable
```

**Content (Body):**
```html
<p><strong>Nueva consulta desde el sitio web</strong></p>

<p><strong>Nombre:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Teléfono:</strong> {{phone}}</p>
<p><strong>Servicio de interés:</strong> {{service}}</p>

<p><strong>Mensaje:</strong></p>
<p>{{message}}</p>

<hr>
<p><em>Este mensaje fue enviado desde el formulario de contacto de DM Bava Estudio Contable</em></p>
```

4. En **"To Email"** coloca: `danielambava@gmail.com`
5. **COPIA el Template ID** (ejemplo: `template_xyz789`)
6. Haz clic en **"Save"**

#### Paso 4: Obtener Public Key

1. Ve a **"Account"** → **"General"**
2. Busca tu **Public Key** (ejemplo: `abcd1234efgh5678`)
3. **COPIA esta Public Key**

#### Paso 5: Configurar en el código

Abre el archivo `js/main.js` y reemplaza las credenciales:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_abc123',     // Tu Service ID aquí
    templateID: 'template_xyz789',   // Tu Template ID aquí
    publicKey: 'abcd1234efgh5678'    // Tu Public Key aquí
};
```

**¡Listo!** El formulario de contacto ya funciona.

---

## 🚀 Despliegue en Netlify

### Opción 1: Desde la interfaz de Netlify

1. Ve a https://app.netlify.com/
2. Haz clic en **"Add new site"** → **"Import an existing project"**
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `dm-bava-contable`
5. Configuración:
   - **Branch to deploy:** `main`
   - **Build command:** (dejar vacío)
   - **Publish directory:** `/`
6. Haz clic en **"Deploy site"**

### Opción 2: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Iniciar sesión
netlify login

# Desplegar
netlify deploy --prod
```

### Dominio personalizado (opcional)

1. En Netlify, ve a **"Domain settings"**
2. Haz clic en **"Add custom domain"**
3. Sigue las instrucciones para configurar tu dominio

---

## 📝 Personalización

### Cambiar textos

Todos los textos están en `index.html`. Busca y reemplaza según necesites.

### Cambiar colores

Edita las variables CSS en `css/styles.css`:

```css
:root {
    --primary: #D4919F;       /* Color principal */
    --accent: #8B5A7A;        /* Color de acento */
    /* ... otros colores */
}
```

### Agregar foto profesional

1. Guarda tu foto en la carpeta `img/` (ejemplo: `img/daniela-bava.jpg`)
2. En `index.html`, busca la sección "Sobre Mí"
3. Reemplaza el placeholder:

```html
<!-- ANTES -->
<div class="about-image-placeholder">
    <i class="bi bi-person-circle"></i>
    <p>Foto profesional</p>
</div>

<!-- DESPUÉS -->
<img src="img/daniela-bava.jpg" alt="Daniela Magalí Bava" class="img-fluid rounded" style="border-radius: 20px; box-shadow: 0 15px 40px rgba(212, 145, 159, 0.3);">
```

### Agregar/modificar servicios

En `index.html`, busca la sección `<!-- Servicio X -->` y duplica el bloque:

```html
<div class="col-md-6 col-lg-4">
    <div class="service-card">
        <div class="service-icon">
            <i class="bi bi-ICONO-AQUI"></i>
        </div>
        <h3 class="service-title">Nombre del Servicio</h3>
        <p class="service-description">Descripción...</p>
        <ul class="service-features">
            <li><i class="bi bi-check-circle-fill"></i> Característica 1</li>
            <li><i class="bi bi-check-circle-fill"></i> Característica 2</li>
        </ul>
    </div>
</div>
```

**Iconos disponibles:** https://icons.getbootstrap.com/

---

## 📱 Integración con WhatsApp

El sitio tiene **dos** botones de WhatsApp:

1. **Botón flotante** (abajo a la derecha)
2. **Botón en el navbar** (arriba a la derecha)
3. **Botón en la sección de contacto**

Todos redirigen al WhatsApp de Daniela: **+54 9 11 2827-6362**

### Personalizar mensaje predeterminado

En `index.html`, busca los enlaces de WhatsApp y modifica el parámetro `text`:

```html
<!-- ANTES -->
<a href="https://wa.me/5491128276362?text=Hola%20Daniela,%20me%20interesa%20consultar%20sobre%20servicios%20contables">

<!-- DESPUÉS (ejemplo) -->
<a href="https://wa.me/5491128276362?text=Hola%20Daniela,%20vi%20tu%20web%20y%20necesito%20asesoramiento%20en%20ganancias">
```

---

## 🔧 Tecnologías Utilizadas

- **HTML5** - Estructura
- **CSS3** - Estilos (diseño personalizado)
- **JavaScript** (Vanilla) - Funcionalidad
- **Bootstrap 5.3.2** - Framework CSS responsive
- **Bootstrap Icons** - Iconografía
- **EmailJS** - Envío de emails del formulario
- **Google Fonts** - Tipografías (Montserrat + Playfair Display)

---

## ✅ Checklist de Lanzamiento

Antes de publicar el sitio, verifica:

- [ ] EmailJS configurado correctamente (`js/main.js`)
- [ ] Foto profesional agregada (opcional)
- [ ] Todos los textos revisados
- [ ] Links de WhatsApp funcionando
- [ ] Email `danielambava@gmail.com` correcto
- [ ] Teléfono `+54 9 11 2827-6362` correcto
- [ ] Prueba del formulario de contacto
- [ ] Prueba en móvil, tablet y desktop
- [ ] SEO: título y descripción correctos

---

## 📞 Soporte

Si tienes problemas con:

- **EmailJS**: Consulta la documentación oficial en https://www.emailjs.com/docs/
- **Netlify**: Consulta https://docs.netlify.com/
- **Dudas generales**: Revisa el archivo `INSTRUCCIONES_RAPIDAS.md`

---

## 🎯 Servicios Incluidos

El sitio presenta 9 servicios contables:

1. ✅ Armado de Balances Empresariales
2. ✅ Declaración Jurada de Ganancias
3. ✅ Alta de Servicios en ARCA
4. ✅ Asesoramiento Impositivo
5. ✅ Planificación Tributaria
6. ✅ Auditoría Contable
7. ✅ Gestión de Facturación Electrónica
8. ✅ Asesoramiento en Inversiones y Capital
9. ✅ Pericia Contable de Parte (PJN y CABA)

---

## 📊 Tipos de Clientes

El sitio está optimizado para atraer:

- 👔 Profesionales Independientes
- 🚀 Emprendedores
- 🏢 PyMEs
- 🌐 Grandes Empresas

---

## 🎨 Características de Diseño

- **Corporativo moderno**: Diseño limpio y profesional
- **Rosado pastel con carácter**: Colores cálidos pero firmes
- **Responsive total**: Perfecto en cualquier dispositivo
- **Animaciones suaves**: Transiciones elegantes
- **Call-to-actions claros**: Botones estratégicos para conversión
- **Carga rápida**: Código optimizado

---

## 📄 Licencia

Este sitio fue desarrollado específicamente para **DM Bava Estudio Contable**.

© 2025 DM Bava Estudio Contable. Todos los derechos reservados.

---

## 🚀 Próximos Pasos Sugeridos

1. Agregar blog con artículos sobre impuestos y contabilidad
2. Integrar calculadora de monotributo online
3. Agregar testimonios de clientes
4. Crear sección de "Preguntas Frecuentes" expandida
5. Integrar calendario para agendar consultas online

---

**¿Necesitas ayuda?** Contacta al desarrollador o consulta la documentación adicional en `INSTRUCCIONES_RAPIDAS.md`.
